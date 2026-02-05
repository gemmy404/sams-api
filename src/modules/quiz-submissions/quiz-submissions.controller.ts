import {Body, Controller, Param, Post, UseGuards} from '@nestjs/common';
import {QuizSubmissionsService} from './quiz-submissions.service';
import {Types} from "mongoose";
import {SubmitAnswerRequestDto} from "./dto/submit-answer-request.dto";
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {ParseObjectIdPipe} from "@nestjs/mongoose";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {AppResponseDto} from "../../common/dto/app-response.dto";

@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class QuizSubmissionsController {

    constructor(private readonly quizSubmissionsService: QuizSubmissionsService) {
    }

    @Post('quizzes/:quizId/submit')
    submitQuiz(
        @Param('quizId', ParseObjectIdPipe) quizId: Types.ObjectId,
        @Body() submitAnswerRequest: SubmitAnswerRequestDto,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<null>> {
        return this.quizSubmissionsService.submitQuiz(quizId, submitAnswerRequest, currentUser);
    }

}
