import {Injectable, NotFoundException} from '@nestjs/common';
import {QuestionsRepository} from "./questions.repository";
import {Types} from "mongoose";
import {AddQuestionsRequestDto} from "./dto/add-questions-request.dto";
import {QuizzesRepository} from "../quiz/quizzes.repository";
import {MaterialsService} from "../materials/materials.service";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {QuestionType} from "./enums/question-type.enum";
import {GradingType} from "../quiz/enums/grading-type.enum";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {QuestionResponseDto} from "./dto/question-response.dto";
import {HttpStatusText} from "../../common/enums/http-status-text.enum";
import {QuestionsMapper} from "./questions.mapper";
import {UserRoles} from "../roles/enums/user-roles.enum";

@Injectable()
export class QuestionsService {

    constructor(
        private readonly questionsRepository: QuestionsRepository,
        private readonly quizzesRepository: QuizzesRepository,
        private readonly materialsService: MaterialsService,
        private readonly questionsMapper: QuestionsMapper,
    ) {
    }

    async addQuestions(
        quizId: Types.ObjectId,
        addQuestionsRequest: AddQuestionsRequestDto,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<QuestionResponseDto[]>> {
        const savedQuiz = await this.quizzesRepository.findQuiz({_id: quizId});
        if (!savedQuiz) {
            throw new NotFoundException('Quiz not found');
        }

        await this.materialsService.authorizeCourseAccess(savedQuiz.course.toString(), currentUser);

        const questionsRequest = addQuestionsRequest.questions
            .map(question => ({...question, quiz: quizId}));

        const createdQuestions = await this.questionsRepository
            .insertQuestions(questionsRequest);

        let totalScore: number = 0, totalTime: number = 0, gradingType: undefined | GradingType;
        createdQuestions.forEach(question => {
            totalScore += question.points;
            totalTime += question.timeLimit;
            if (!gradingType && question.questionType === QuestionType.WRITTEN) {
                gradingType = GradingType.MANUAL;
            }
        });

        await this.quizzesRepository.updateQuiz({_id: quizId}, {
            $inc: {
                numberOfQuestions: createdQuestions.length,
                totalScore: totalScore,
                totalTime: totalTime,
            },
            $set: {
                gradingType: gradingType,
                isPublished: true,
            }
        });

        const userRole = (currentUser.roles as UserRoles[])
            .includes(UserRoles.STUDENT) ? UserRoles.STUDENT : UserRoles.INSTRUCTOR;

        const appResponse: AppResponseDto<QuestionResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: createdQuestions.map(question =>
                this.questionsMapper.toQuestionResponse(question, userRole)
            )
        };

        return appResponse;
    }

}
