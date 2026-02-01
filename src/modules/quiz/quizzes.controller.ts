import {Controller, Get, Param, UseGuards} from '@nestjs/common';
import {QuizzesService} from './quizzes.service';
import {ApiResponse, ApiTags} from "@nestjs/swagger";
import {Types} from "mongoose";
import {ParseObjectIdPipe} from "@nestjs/mongoose";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {QuizResponseDto} from "./dto/quiz-response.dto";
import {AppResponseDto} from "../../common/dto/app-response.dto";

@ApiTags('Quiz Controller')
@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class QuizzesController {
    constructor(private readonly quizzesService: QuizzesService) {
    }

    @Get('courses/:courseId/quizzes')
    @ApiResponse({type: [QuizResponseDto]})
    findAllQuizzes(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<QuizResponseDto[]>> {
        return this.quizzesService.findAllQuizzes(courseId, currentUser);
    }

    @Get('quizzes/:quizId')
    @ApiResponse({type: QuizResponseDto})
    findQuizDetails(
        @Param('quizId', ParseObjectIdPipe) quizId: Types.ObjectId,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<QuizResponseDto>> {
        return this.quizzesService.findQuizDetails(quizId, currentUser);
    }

}
