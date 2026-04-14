import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {AssignmentSubmissionsRepository} from "./assignment-submissions.repository";
import {Types} from "mongoose";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {AddAssignSubmissionRequestDto} from "./dto/add-assign-submission-request.dto";
import {AssignmentsRepository} from "../assignments/assignments.repository";
import {MaterialsService} from "../materials/materials.service";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {HttpStatusText} from "../../common/enums/http-status-text.enum";
import {CoursesRepository} from "../courses/courses.repository";
import {Assignment} from "../assignments/schemas/assignments.schema";
import {AssignmentSubmissionsMapper} from "./assignment-submissions.mapper";
import {SubmissionResponseDto} from "./dto/submission-response.dto";
import {Course} from "../courses/schemas/courses.schema";
import {GradesRepository} from "../grades/grades.repository";
import {AssignmentSubmission} from "./schemas/assignment-submissions.schema";
import {GradedSubmissionRequestDto} from "./dto/graded-submission-request.dto";
import {SubmissionActionStatus} from "./enums/submission-action-status.enum";
import {Grade} from "../grades/schemas/grades.schema";
import {PaginationQueryDto} from "../../common/dto/pagination-query.dto";
import {constructPagination} from "../../common/utils/pagination.util";
import {GetAllSubmissionResponseDto} from "./dto/get-all-submission-response.dto";

@Injectable()
export class AssignmentSubmissionsService {

    constructor(
        private readonly assignmentSubmissionsRepository: AssignmentSubmissionsRepository,
        private readonly assignmentsRepository: AssignmentsRepository,
        private readonly coursesRepository: CoursesRepository,
        private readonly gradesRepository: GradesRepository,
        private readonly materialsService: MaterialsService,
        private readonly assignmentSubmissionsMapper: AssignmentSubmissionsMapper,
    ) {
    }

    async submitAssignment(
        assignmentId: Types.ObjectId,
        addAssignSubmissionRequest: AddAssignSubmissionRequestDto,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<null>> {
        const savedAssignment = await this.assignmentsRepository.findOne({
            _id: assignmentId
        });
        if (!savedAssignment) {
            throw new NotFoundException('Assignment not found');
        }

        await this.materialsService.authorizeCourseAccess(savedAssignment.course.toString(), currentUser);

        const now = new Date();
        const studentId = new Types.ObjectId(currentUser._id);

        if (savedAssignment.dueDate.getTime() < now.getTime()) {
            throw new BadRequestException('You cannot submit this assignment after the due date');
        }

        const savedSubmission = await this.assignmentSubmissionsRepository.findOne({
            student: studentId,
            assignment: assignmentId,
        });

        if (savedSubmission) {
            await this.assignmentSubmissionsRepository.updateSubmission({_id: savedSubmission._id},
                {
                    $push: {
                        submittedItems: {$each: addAssignSubmissionRequest.submittedItems},
                    },
                    $set: {
                        submittedAt: now,
                    },
                });
        } else {
            await this.assignmentSubmissionsRepository
                .createSubmission({
                    submittedAt: now,
                    neededReview: false,
                    student: studentId,
                    assignment: savedAssignment._id,
                    course: savedAssignment.course,
                    submittedItems: addAssignSubmissionRequest.submittedItems,
                });
        }

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: 'Assignment submitted successfully',
            data: null,
        };

        return appResponse;
    }

    async unsubmitAssignment(
        submissionId: Types.ObjectId,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<null>> {
        const savedSubmission = await this.assignmentSubmissionsRepository.findOne({
            _id: submissionId,
        });
        if (!savedSubmission) {
            throw new NotFoundException('Submission not found');
        }

        if (savedSubmission.student.toString() !== currentUser._id) {
            throw new ForbiddenException('Submission is not yours');
        }

        await this.assignmentSubmissionsRepository.deleteAndReturn({_id: submissionId});

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: 'Submission deleted successfully',
            data: null,
        }

        return appResponse;
    }

    async getAllSubmissions(
        assignmentId: Types.ObjectId,
        paginationQuery: PaginationQueryDto
    ): Promise<AppResponseDto<GetAllSubmissionResponseDto>> {
        const {page, size} = paginationQuery;
        const skip: number = (page - 1) * size;

        const {savedSubmissions, totalElements} = await this.assignmentSubmissionsRepository.findAllPaginated({
                assignment: assignmentId,
            },
            {submittedItems: false},
            [
                {path: 'assignment', select: 'classworkId'},
                {path: 'student', select: 'name academicId profilePic'},
            ],
            size,
            skip,
        );

        const savedCourse = await this.coursesRepository.findCourse({
                _id: savedSubmissions[0]?.course,
            },
            {classwork: true}
        );

        const classworkId: Types.ObjectId = (savedSubmissions[0]?.assignment as unknown as Assignment)?.classworkId;
        const points: number | undefined = savedCourse?.classwork
            .find(cw => cw._id!.equals(classworkId))!
            .points;

        const marked: number = await this.assignmentSubmissionsRepository.countSubmissions({
            assignment: assignmentId,
            neededReview: false,
        });
        const unmarked: number = await this.assignmentSubmissionsRepository.countSubmissions({
            assignment: assignmentId,
            neededReview: true,
        });

        const response: GetAllSubmissionResponseDto = {
            stats: {
                submitted: totalElements,
                marked: marked,
                unmarked: unmarked,
            },
            submissions: savedSubmissions.map(sub =>
                this.assignmentSubmissionsMapper.toSubmissionResponse(sub, points)
            ),
        };

        const appResponse: AppResponseDto<GetAllSubmissionResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: response,
            pagination: constructPagination(totalElements, page, size),
        };

        return appResponse;
    }

    async getSubmissionDetails(
        submissionId: Types.ObjectId
    ): Promise<AppResponseDto<SubmissionResponseDto>> {
        const savedSubmission = await this.assignmentSubmissionsRepository.findOne({
                _id: submissionId,
            },
            [
                {path: 'assignment', select: 'classworkId'},
                {path: 'course', select: 'classwork'},
                {path: 'student', select: 'name academicId profilePic'},
            ]
        );
        if (!savedSubmission) {
            throw new NotFoundException('Submission not found');
        }

        const classworkId: Types.ObjectId = (savedSubmission.assignment as unknown as Assignment).classworkId;
        const classwork = (savedSubmission.course as unknown as Course).classwork;
        const points: number = classwork
            .find(cw => cw._id!.equals(classworkId))!
            .points;

        const appResponse: AppResponseDto<SubmissionResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.assignmentSubmissionsMapper.toSubmissionResponse(savedSubmission, points),
        };

        return appResponse;
    }

    async gradeAssignmentSubmission(
        submissionId: Types.ObjectId,
        submissionAction: GradedSubmissionRequestDto
    ): Promise<AppResponseDto<null>> {
        const savedSubmission = await this.assignmentSubmissionsRepository.findOne({
                _id: submissionId,
            },
            [
                {path: 'assignment', select: 'classworkId'},
                {path: 'course', select: 'classwork'},
            ]
        );
        if (!savedSubmission) {
            throw new NotFoundException('Submission not found');
        }

        await this.insertGrade(savedSubmission, submissionAction.action);

        await this.assignmentSubmissionsRepository.updateSubmission({_id: submissionId},
            {
                $set: {neededReview: false},
            }
        );

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: 'Submission graded successfully',
            data: null,
        };

        return appResponse;
    }

    private async insertGrade(
        savedSubmission: AssignmentSubmission,
        submissionAction: SubmissionActionStatus,
    ): Promise<void> {
        const classworkId: Types.ObjectId = (savedSubmission.assignment as unknown as Assignment).classworkId;
        const classwork = (savedSubmission.course as unknown as Course).classwork;
        const points: number = classwork
            .find(cw => cw._id!.equals(classworkId))!
            .points;

        const savedGrade = await this.gradesRepository.findOne({
            student: savedSubmission.student,
            course: savedSubmission.course._id,
            classworkId: classworkId,
        });
        if (savedGrade) {
            throw new BadRequestException('You have already graded this submission');
        }

        const grade: Grade = {
            student: savedSubmission.student,
            course: savedSubmission.course,
            classworkId: classworkId,
            score: submissionAction === SubmissionActionStatus.APPROVED ? points : 0,
            maxScore: points,
        };
        await this.gradesRepository.createGrade(grade);
    }

}
