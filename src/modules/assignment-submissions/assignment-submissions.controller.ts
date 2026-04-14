import {Body, Controller, Delete, Param, Post, UseGuards} from '@nestjs/common';
import {AssignmentSubmissionsService} from './assignment-submissions.service';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {Types} from "mongoose";
import {ParseObjectIdPipe} from "@nestjs/mongoose";
import {AddAssignSubmissionRequestDto} from "./dto/add-assign-submission-request.dto";
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {AppResponseDto} from "../../common/dto/app-response.dto";

@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class AssignmentSubmissionsController {

    constructor(private readonly assignmentSubmissionsService: AssignmentSubmissionsService) {
    }

    @Post('assignments/:assignmentId/submissions')
    submitAssignment(
        @Param('assignmentId', ParseObjectIdPipe) assignmentId: Types.ObjectId,
        @Body() addAssignSubmissionRequest: AddAssignSubmissionRequestDto,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<null>> {
        return this.assignmentSubmissionsService.submitAssignment(assignmentId, addAssignSubmissionRequest, currentUser);
    }

    @Delete('assignment-submissions/:submissionId')
    unsubmitAssignment(
        @Param('submissionId', ParseObjectIdPipe) submissionId: Types.ObjectId,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<null>> {
        return this.assignmentSubmissionsService.unsubmitAssignment(submissionId, currentUser);
    }

}
