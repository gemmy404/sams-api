import {Body, Controller, Get, Param, Patch, Query, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {Roles} from "../../common/decorators/roles.decorator";
import {UserRoles} from "../roles/enums/user-roles.enum";
import {RolesGuard} from "../auth/guards/roles.guard";
import {ApiBearerAuth, ApiResponse} from "@nestjs/swagger";
import {QuizSubmissionsService} from "../quiz-submissions/quiz-submissions.service";
import {QuizSubmissionResponseDto} from "../quiz-submissions/dto/quiz-submission-response.dto";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {Types} from "mongoose";
import {ParseObjectIdPipe} from "@nestjs/mongoose";
import {PaginationQueryDto} from "../../common/dto/pagination-query.dto";
import {AnswerDetailsResponseDto} from "../quiz-submissions/dto/answer-details-response.dto";
import {CorrectWrittenQuestionRequestDto} from "../quiz-submissions/dto/correct-written-question-request.dto";

@ApiBearerAuth('access-token')
@Controller('api/v1/instructor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.INSTRUCTOR)
export class InstructorQuizSubmissionController {

    constructor(private readonly quizSubmissionsService: QuizSubmissionsService) {
    }

    @Get('quizzes/:quizId/submissions')
    @ApiResponse({type: [QuizSubmissionResponseDto]})
    getQuizSubmissions(
        @Param('quizId', ParseObjectIdPipe) quizId: Types.ObjectId,
        @Query() paginationQuery: PaginationQueryDto
    ): Promise<AppResponseDto<QuizSubmissionResponseDto[]>> {
        return this.quizSubmissionsService.getQuizSubmissions(quizId, paginationQuery);
    }

    @Get('submissions/:submissionId')
    @ApiResponse({type: [AnswerDetailsResponseDto]})
    getSubmissionDetails(
        @Param('submissionId', ParseObjectIdPipe) submissionId: Types.ObjectId
    ): Promise<AppResponseDto<AnswerDetailsResponseDto[]>> {
        return this.quizSubmissionsService.getSubmissionDetails(submissionId);
    }

    @Patch('submissions/:submissionId/questions/:questionId')
    gradeQuestion(
        @Param('submissionId', ParseObjectIdPipe) submissionId: Types.ObjectId,
        @Param('questionId', ParseObjectIdPipe) questionId: Types.ObjectId,
        @Body() correctWrittenQuestionRequest: CorrectWrittenQuestionRequestDto
    ): Promise<AppResponseDto<null>> {
        return this.quizSubmissionsService.gradeQuestion(submissionId, questionId, correctWrittenQuestionRequest)
    }

}
