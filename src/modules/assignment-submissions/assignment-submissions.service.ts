import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {AssignmentSubmissionsRepository} from "./assignment-submissions.repository";
import {Types} from "mongoose";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {AddAssignSubmissionRequestDto} from "./dto/add-assign-submission-request.dto";
import {AssignmentsRepository} from "../assignments/assignments.repository";
import {MaterialsService} from "../materials/materials.service";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {HttpStatusText} from "../../common/enums/http-status-text.enum";

@Injectable()
export class AssignmentSubmissionsService {

    constructor(
        private readonly assignmentSubmissionsRepository: AssignmentSubmissionsRepository,
        private readonly assignmentsRepository: AssignmentsRepository,
        private readonly materialsService: MaterialsService,
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

}
