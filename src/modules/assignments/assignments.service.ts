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

@Injectable()
export class AssignmentsService {

    constructor(
        private readonly assignmentsRepository: AssignmentsRepository,
        private readonly assignmentsMapper: AssignmentsMapper,
        private readonly coursesRepository: CoursesRepository,
        private readonly materialsService: MaterialsService,
        private readonly s3Service: S3Service,
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
            .find(cw => cw._id!.toString() === addAssignmentRequest.classworkId.toString());
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
            data: this.assignmentsMapper.toAssignmentResponse(createdAssignment),
        };

        return appResponse;
    }

    async findAllAssignments(
        courseId: Types.ObjectId,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<AssignmentResponseDto[]>> {
        await this.materialsService.authorizeCourseAccess(courseId.toString(), currentUser);

        const assignments = await this.assignmentsRepository
            .findAll({course: courseId,}, {assignmentItems: false});

        const appResponse: AppResponseDto<AssignmentResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: assignments.map(this.assignmentsMapper.toAssignmentResponse),
        };

        return appResponse;
    }

    async findAssignmentDetails(
        assignmentId: Types.ObjectId,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<AssignmentResponseDto>> {
        const savedAssignment = await this.assignmentsRepository.findOne({
            _id: assignmentId,
        });
        if (!savedAssignment) {
            throw new NotFoundException('Assignment not found');
        }

        await this.materialsService.authorizeCourseAccess(savedAssignment.course.toString(), currentUser);

        const appResponse: AppResponseDto<AssignmentResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.assignmentsMapper.toAssignmentResponse(savedAssignment),
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

        // remain delete assignment submissions

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
            });

        const appResponse: AppResponseDto<AssignmentResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.assignmentsMapper.toAssignmentResponse(updatedAssignment!)
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
            });
        await this.s3Service.deleteFile(itemKey);

        const appResponse: AppResponseDto<AssignmentResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.assignmentsMapper.toAssignmentResponse(updatedAssignment!)
        };

        return appResponse;
    }

}
