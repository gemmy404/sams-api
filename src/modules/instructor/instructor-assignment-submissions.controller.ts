import {Body, Controller, Get, Param, Post, Query, UseGuards} from "@nestjs/common";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {RolesGuard} from "../auth/guards/roles.guard";
import {AssignmentSubmissionsService} from "../assignment-submissions/assignment-submissions.service";
import {ParseObjectIdPipe} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {SubmissionResponseDto} from "../assignment-submissions/dto/submission-response.dto";
import {ApiBearerAuth, ApiResponse} from "@nestjs/swagger";
import {Roles} from "../../common/decorators/roles.decorator";
import {UserRoles} from "../roles/enums/user-roles.enum";
import {IsAssignmentOwnerGuard} from "../assignments/guards/is-assignment-owner.guard";
import {GradedSubmissionRequestDto} from "../assignment-submissions/dto/graded-submission-request.dto";

@ApiBearerAuth('access-token')
@Controller('api/v1/instructor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.INSTRUCTOR)
export class InstructorAssignmentSubmissionsController {

    constructor(private readonly assignmentSubmissionsService: AssignmentSubmissionsService) {
    }

    @Get('assignments/:assignmentId/submissions')
    @UseGuards(IsAssignmentOwnerGuard)
    @ApiResponse({type: [SubmissionResponseDto]})
    getAllSubmissions(
        @Param('assignmentId', ParseObjectIdPipe) assignmentId: Types.ObjectId,
    ): Promise<AppResponseDto<SubmissionResponseDto[]>> {
        return this.assignmentSubmissionsService.getAllSubmissions(assignmentId);
    }

    @Get('assignment-submissions/:submissionId')
    @ApiResponse({type: SubmissionResponseDto})
    getSubmissionDetails(
        @Param('submissionId', ParseObjectIdPipe) submissionId: Types.ObjectId,
    ): Promise<AppResponseDto<SubmissionResponseDto>> {
        return this.assignmentSubmissionsService.getSubmissionDetails(submissionId);
    }

    @Post('assignment-submissions/:submissionId/grade')
    gradeAssignmentSubmission(
        @Param('submissionId', ParseObjectIdPipe) submissionId: Types.ObjectId,
        @Body() submissionAction: GradedSubmissionRequestDto
    ): Promise<AppResponseDto<null>> {
        return this.assignmentSubmissionsService.gradeAssignmentSubmission(submissionId, submissionAction);
    }

}
