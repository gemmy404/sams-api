import {Body, Controller, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {Roles} from "../../common/decorators/roles.decorator";
import {UserRoles} from "../roles/enums/user-roles.enum";
import {RolesGuard} from "../auth/guards/roles.guard";
import {ApiBearerAuth, ApiResponse} from "@nestjs/swagger";
import {QuizzesService} from "../quiz/quizzes.service";
import {ParseObjectIdPipe} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {IsCourseOwnerGuard} from "../courses/guards/is-course-owner.guard";
import {CreateQuizRequestDto} from "../quiz/dto/create-quiz-request.dto";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {QuizResponseDto} from "../quiz/dto/quiz-response.dto";
import {UpdateQuizRequestDto} from "../quiz/dto/update-quiz-request.dto";

@ApiBearerAuth('access-token')
@Controller('api/v1/instructor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.INSTRUCTOR)
export class InstructorQuizController {

    constructor(private readonly quizzesService: QuizzesService) {
    }

    @Post('courses/:courseId/quizzes')
    @UseGuards(IsCourseOwnerGuard)
    @ApiResponse({type: QuizResponseDto})
    createQuiz(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
        @Body() createQuizDto: CreateQuizRequestDto
    ): Promise<AppResponseDto<QuizResponseDto>> {
        return this.quizzesService.createQuiz(courseId, createQuizDto);
    }

    @Patch('quizzes/:quizId')
    @ApiResponse({type: QuizResponseDto})
    updateQuiz(
        @Param('quizId', ParseObjectIdPipe) quizId: Types.ObjectId,
        @Body() updateQuizRequest: UpdateQuizRequestDto,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<QuizResponseDto>> {
        return this.quizzesService.updateQuiz(quizId, updateQuizRequest, currentUser);
    }

    @Patch('quizzes/:quizId/toggle-published')
    @ApiResponse({type: QuizResponseDto})
    togglePublishedQuiz(
        @Param('quizId', ParseObjectIdPipe) quizId: Types.ObjectId,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<QuizResponseDto>> {
        return this.quizzesService.togglePublishedQuiz(quizId, currentUser);
    }

}
