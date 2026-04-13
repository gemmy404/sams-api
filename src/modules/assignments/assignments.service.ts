import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {AssignmentsRepository} from "./assignments.repository";
import {AddAssignmentRequestDto} from "./dto/add-assignment-request.dto";
import {Types} from "mongoose";
import {CoursesRepository} from "../courses/courses.repository";
import {Assignment} from "./schemas/assignments.schema";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {HttpStatusText} from "../../common/enums/http-status-text.enum";
import {AssignmentResponseDto} from "./dto/assignment-response.dto";
import {AssignmentsMapper} from "./assignments.mapper";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {MaterialsService} from "../materials/materials.service";
import {S3Service} from "../s3/s3.service";
import {AddAssignmentItemsRequestDto} from "./dto/add-assignment-items-request.dto";
import {MediaItem} from "../../common/schemas/media-item.schema";
import {AssignmentMySubResponseDto} from "../assignment-submissions/dto/assignment-my-sub-response.dto";
import {UserRoles} from "../roles/enums/user-roles.enum";
import {AssignmentSubmissionsRepository} from "../assignment-submissions/assignment-submissions.repository";
import {AssignmentSubmissionStatus} from "../assignment-submissions/enums/assignment-submission.status.enum";
import {MediaItemsResponseDto} from "../materials/dto/media-items-response.dto";
import {getStaticUrl} from "../../common/utils/get-static-url.util";
import {AssignmentSubmission} from "../assignment-submissions/schemas/assignment-submissions.schema";

@Injectable()
export class AssignmentsService {

    constructor(
        private readonly assignmentsRepository: AssignmentsRepository,
        private readonly assignmentsMapper: AssignmentsMapper,
        private readonly coursesRepository: CoursesRepository,
        private readonly materialsService: MaterialsService,
        private readonly s3Service: S3Service,
        private readonly assignmentsSubmissionsRepository: AssignmentSubmissionsRepository,
    ) {
    }

    async createAssignment(
        courseId: Types.ObjectId,
        addAssignmentRequest: AddAssignmentRequestDto
    ): Promise<AppResponseDto<AssignmentResponseDto>> {
        const savedCourse = await this.coursesRepository.findCourse({
            _id: courseId
        });
        if (!savedCourse) {
            throw new NotFoundException('Course not found');
        }

        const savedClasswork = savedCourse.classwork
            .find(cw => cw._id!.equals(addAssignmentRequest.classworkId));
        if (!savedClasswork) {
            throw new NotFoundException('Classwork not found');
        }

        if (savedClasswork.isUsed) {
            throw new BadRequestException('This classwork is already used in another assignment')
        }

        await this.coursesRepository.updateCourse(
            {
                _id: courseId,
                "classwork._id": addAssignmentRequest.classworkId,
            },
            {
                $set: {"classwork.$[elem].isUsed": true}
            },
            {
                arrayFilters: [{"elem._id": addAssignmentRequest.classworkId}],
                new: true,
            }
        );

        const createdAssignment = await this.assignmentsRepository.createAssignment({
            ...addAssignmentRequest,
            course: courseId,
        } as Assignment);

        const appResponse: AppResponseDto<AssignmentResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.assignmentsMapper.toAssignmentResponse(createdAssignment, savedClasswork.points),
        };

        return appResponse;
    }

    async findAllAssignments(
        courseId: Types.ObjectId,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<AssignmentResponseDto[]>> {
        await this.materialsService.authorizeCourseAccess(courseId.toString(), currentUser);

        const assignments = await this.assignmentsRepository
            .findAll({course: courseId,}, {assignmentItems: false},
                [{path: 'course', select: 'classwork'}]
            );

        const isInstructor = (currentUser.roles as UserRoles[]).includes(UserRoles.INSTRUCTOR)
        let appResponse: AppResponseDto<AssignmentResponseDto[]>;

        if (isInstructor) {
            appResponse = {
                status: HttpStatusText.SUCCESS,
                data: assignments.map(this.assignmentsMapper.toAssignmentResponse),
            };
            return appResponse;
        }

        const studentResponse: AssignmentResponseDto[] = await this
            .mapAssignmentsWithStudentStatus(courseId, assignments, currentUser);

        appResponse = {
            status: HttpStatusText.SUCCESS,
            data: studentResponse,
        };

        return appResponse;
    }

    async findAssignmentDetails(
        assignmentId: Types.ObjectId,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<AssignmentResponseDto | AssignmentMySubResponseDto>> {
        const savedAssignment = await this.assignmentsRepository.findOne({
                _id: assignmentId,
            },
            [{path: 'course', select: 'classwork'}]
        );
        if (!savedAssignment) {
            throw new NotFoundException('Assignment not found');
        }

        await this.materialsService.authorizeCourseAccess(savedAssignment.course._id.toString(), currentUser);

        const isInstructor = (currentUser.roles as UserRoles[]).includes(UserRoles.INSTRUCTOR)
        let appResponse: AppResponseDto<AssignmentResponseDto | AssignmentMySubResponseDto>;

        if (isInstructor) {
            appResponse = {
                status: HttpStatusText.SUCCESS,
                data: this.assignmentsMapper.toAssignmentResponse(savedAssignment),
            };
            return appResponse;
        }

        const studentResponse = await this
            .prepareStudentAssignmentView(assignmentId, savedAssignment, currentUser);

        appResponse = {
            status: HttpStatusText.SUCCESS,
            data: studentResponse,
        };

        return appResponse;
    }

    async deleteAssignment(assignmentId: Types.ObjectId): Promise<AppResponseDto<null>> {
        const deletedAssignment = await this.assignmentsRepository.deleteAndReturn({
            _id: assignmentId,
        });

        await this.coursesRepository.updateCourse(
            {
                _id: deletedAssignment!.course,
                "classwork._id": deletedAssignment!.classworkId,
            },
            {
                $set: {"classwork.$[elem].isUsed": false}
            },
            {
                arrayFilters: [{"elem._id": deletedAssignment!.classworkId}]
            }
        );

        await this.assignmentsSubmissionsRepository.deleteSubmission({assignment: assignmentId});

        const keys: { Key: string }[] = deletedAssignment!.assignmentItems.map(item => (
            {Key: item.contentReference}
        ));
        if (keys.length > 0)
            await this.s3Service.deleteMultipleFiles(keys);

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: `Assignment deleted successfully, and classwork unlocked`,
            data: null,
        };

        return appResponse;
    }

    async addAssignmentItems(
        assignmentId: Types.ObjectId,
        addAssignmentItemsRequest: AddAssignmentItemsRequestDto
    ): Promise<AppResponseDto<AssignmentResponseDto>> {
        const updatedAssignment = await this.assignmentsRepository
            .updateAssignment({_id: assignmentId}, {
                    $push: {
                        assignmentItems: {$each: addAssignmentItemsRequest.assignmentItems}
                    }
                },
                [{path: 'course', select: 'classwork'}]
            );

        const appResponse: AppResponseDto<AssignmentResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.assignmentsMapper.toAssignmentResponse(updatedAssignment!),
        };

        return appResponse;
    }

    async deleteAssignmentItems(
        assignmentId: Types.ObjectId,
        itemKey: string
    ): Promise<AppResponseDto<AssignmentResponseDto>> {
        const savedAssignment = await this.assignmentsRepository.findOne({
            _id: assignmentId
        });

        const itemToDelete: MediaItem | undefined = savedAssignment!.assignmentItems.find(
            (item: MediaItem) => item.contentReference === itemKey
        );
        if (!itemToDelete) {
            throw new NotFoundException('File not found in this assignment');
        }

        const updatedAssignment = await this.assignmentsRepository
            .updateAssignment({_id: assignmentId}, {
                    $pull: {
                        assignmentItems: {
                            contentReference: itemKey
                        }
                    }
                },
                [{path: 'course', select: 'classwork'}]
            );
        await this.s3Service.deleteFile(itemKey);

        const appResponse: AppResponseDto<AssignmentResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.assignmentsMapper.toAssignmentResponse(updatedAssignment!),
        };

        return appResponse;
    }

    private async mapAssignmentsWithStudentStatus(
        courseId: Types.ObjectId,
        assignments: Assignment[],
        currentUser: CurrentUserDto
    ): Promise<AssignmentResponseDto[]> {
        const savedSubmissions = await this.assignmentsSubmissionsRepository.findAll({
            student: new Types.ObjectId(currentUser._id),
            course: courseId,
        });

        const submissionsMap = new Map<string, AssignmentSubmission>(
            savedSubmissions.map(sub => [sub.assignment.toString(), sub])
        );
        const studentResponse: AssignmentResponseDto[] = [];

        assignments.forEach(assign => {
            const assignResponse = this.assignmentsMapper.toAssignmentResponse(assign);

            assignResponse.status = this
                .calculateStudentStatus(assign.dueDate, submissionsMap.get(assign._id!.toString()));

            studentResponse.push(assignResponse);
        });

        return studentResponse;
    }

    private async prepareStudentAssignmentView(
        assignmentId: Types.ObjectId,
        savedAssignment: Assignment,
        currentUser: CurrentUserDto
    ) {
        const savedSubmission = await this.assignmentsSubmissionsRepository.findOne({
            student: new Types.ObjectId(currentUser._id),
            assignment: assignmentId,
        });

        const status: AssignmentSubmissionStatus = this
            .calculateStudentStatus(savedAssignment.dueDate, savedSubmission);

        let submittedItems: MediaItemsResponseDto[] = [];
        if (savedSubmission && savedSubmission.submittedItems.length > 0) {
            submittedItems = savedSubmission.submittedItems.map(item => ({
                originalFileName: item.originalFileName,
                key: item.contentReference,
                displayUrl: getStaticUrl(item.contentReference)!
            }));
        }

        const studentResponse = {
            ...this.assignmentsMapper.toAssignmentResponse(savedAssignment),
            status: status,
            submissionId: savedSubmission ? savedSubmission._id.toString() : null,
            submittedItems: submittedItems,
        };

        return studentResponse;
    }

    private calculateStudentStatus(
        dueDate: Date,
        submission?: AssignmentSubmission | null
    ): AssignmentSubmissionStatus {
        if (submission)
            return AssignmentSubmissionStatus.HANDED_IN;

        return dueDate.getTime() < Date.now()
            ? AssignmentSubmissionStatus.MISSED
            : AssignmentSubmissionStatus.ASSIGNED;
    }
}
