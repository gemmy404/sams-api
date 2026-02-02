import {Body, Controller, Param, Post, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {Roles} from "../../common/decorators/roles.decorator";
import {UserRoles} from "../roles/enums/user-roles.enum";
import {RolesGuard} from "../auth/guards/roles.guard";
import {ApiBearerAuth, ApiResponse} from "@nestjs/swagger";
import {ParseObjectIdPipe} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {AddQuestionsRequestDto} from "../questions/dto/add-questions-request.dto";
import {QuestionResponseDto} from "../questions/dto/question-response.dto";
import {QuestionsService} from "../questions/questions.service";

@ApiBearerAuth('access-token')
@Controller('api/v1/instructor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.INSTRUCTOR)
export class InstructorQuestionsController {

    constructor(private readonly questionsService: QuestionsService) {
    }

    @Post('quizzes/:quizId/questions')
    @ApiResponse({type: [QuestionResponseDto]})
    addQuestions(
        @Param('quizId', ParseObjectIdPipe) quizId: Types.ObjectId,
        @Body() addQuestionsRequest: AddQuestionsRequestDto,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<QuestionResponseDto[]>> {
        return this.questionsService.addQuestions(quizId, addQuestionsRequest, currentUser);
    }

}
