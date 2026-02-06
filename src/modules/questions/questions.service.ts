import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
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
import {Quiz} from "../quiz/schemas/quizzes.schema";
import {UpdateQuestionRequestDto} from "./dto/update-question-request.dto";

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

        const userRole: UserRoles = (currentUser.roles as UserRoles[])
            .includes(UserRoles.STUDENT) ? UserRoles.STUDENT : UserRoles.INSTRUCTOR;

        const appResponse: AppResponseDto<QuestionResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: createdQuestions.map(question =>
                this.questionsMapper.toQuestionResponse(question, userRole)
            )
        };

        return appResponse;
    }

    async updateQuestion(
        questionId: Types.ObjectId,
        updateQuestionRequest: UpdateQuestionRequestDto,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<QuestionResponseDto>> {
        const savedQuestion = await this.questionsRepository.findQuestion({
                _id: questionId
            },
        );
        if (!savedQuestion) {
            throw new NotFoundException('Question not found');
        }

        const quiz = savedQuestion.quiz as unknown as Quiz;
        await this.materialsService.authorizeCourseAccess(quiz.course._id.toString(), currentUser);

        if (quiz.startTime.getTime() < Date.now()) {
            throw new BadRequestException('You can only modify questions before the start time');
        }

        const {points, timeLimit} = updateQuestionRequest;
        const updateQuizData = {
            totalScore: (points !== undefined) ? (points - savedQuestion.points) : 0,
            totalTime: (timeLimit !== undefined) ? (timeLimit - savedQuestion.timeLimit) : 0,
        };

        if (updateQuestionRequest.questionType === QuestionType.WRITTEN) {
            updateQuestionRequest.options = [];
        }

        const updatedQuestion = await this.questionsRepository.updateQuestion(
            {_id: questionId},
            updateQuestionRequest,
        );

        const allQuestions = await this.questionsRepository.findAll({
            quiz: quiz._id
        }, {questionType: true});
        const gradingType: GradingType = allQuestions.some(q =>
            q.questionType === QuestionType.WRITTEN
        ) ? GradingType.MANUAL : GradingType.AUTOMATIC;

        await this.quizzesRepository.updateQuiz(
            {_id: quiz._id},
            {
                $set: {
                    gradingType: gradingType
                },
                $inc: {
                    totalScore: updateQuizData.totalScore,
                    totalTime: updateQuizData.totalTime,
                }
            }
        );

        const userRole: UserRoles = (currentUser.roles as UserRoles[])
            .includes(UserRoles.STUDENT) ? UserRoles.STUDENT : UserRoles.INSTRUCTOR;

        const appResponse: AppResponseDto<QuestionResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.questionsMapper.toQuestionResponse(updatedQuestion!, userRole)
        };

        return appResponse;
    }

    async deleteQuestion(
        questionId: Types.ObjectId,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<null>> {
        const savedQuestion = await this.questionsRepository.findQuestion({
                _id: questionId
            },
            {options: false}
        );
        if (!savedQuestion) {
            throw new NotFoundException('Question not found');
        }

        const quiz = savedQuestion.quiz as unknown as Quiz;
        await this.materialsService.authorizeCourseAccess(quiz.course._id.toString(), currentUser);

        if (quiz.startTime.getTime() < Date.now()) {
            throw new BadRequestException('You can only modify questions before the start time');
        }

        await this.questionsRepository.deleteQuestion({_id: questionId});

        const allQuestions = await this.questionsRepository.findAll({
            quiz: quiz._id
        }, {questionType: true});
        const gradingType: GradingType = allQuestions.some(q =>
            q.questionType === QuestionType.WRITTEN
        ) ? GradingType.MANUAL : GradingType.AUTOMATIC;

        await this.quizzesRepository.updateQuiz(
            {_id: quiz._id},
            {
                $set: {
                    gradingType: gradingType,
                },
                $inc: {
                    numberOfQuestions: -1,
                    totalScore: -savedQuestion.points,
                    totalTime: -savedQuestion.timeLimit,
                }
            }
        );

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: "Question deleted successfully",
            data: null,
        };

        return appResponse;
    }

}
