import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {QuizSubmissionsRepository} from "./quiz-submissions.repository";
import {SubmitAnswerRequestDto} from "./dto/submit-answer-request.dto";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {Types} from "mongoose";
import {QuizzesRepository} from "../quiz/quizzes.repository";
import {SubmissionStatus} from "./enums/submission-status.enum";
import {QuizSubmissionsUtil} from "./quiz-submissions.util";
import {QuestionsRepository} from "../questions/questions.repository";
import {AnswerDto} from "./dto/answer.dto";
import {UserAnswer} from "./schemas/user-answers.schema";
import {Question} from "../questions/schemas/questions.schema";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {HttpStatusText} from "../../common/enums/http-status-text.enum";
import {PaginationQueryDto} from "../../common/dto/pagination-query.dto";
import {constructPagination} from "../../common/utils/pagination.util";
import {QuizSubmissionsMapper} from "./quiz-submissions.mapper";
import {QuizSubmissionResponseDto} from "./dto/quiz-submission-response.dto";
import {QuestionsMapper} from "../questions/questions.mapper";
import {UserRoles} from "../roles/enums/user-roles.enum";
import {QuestionResponseDto} from "../questions/dto/question-response.dto";
import {AnswerDetailsResponseDto} from "./dto/answer-details-response.dto";
import {CorrectWrittenQuestionRequestDto} from "./dto/correct-written-question-request.dto";

@Injectable()
export class QuizSubmissionsService {

    constructor(
        private readonly quizSubmissionsRepository: QuizSubmissionsRepository,
        private readonly quizzesRepository: QuizzesRepository,
        private readonly questionsRepository: QuestionsRepository,
        private readonly quizSubmissionsMapper: QuizSubmissionsMapper,
        private readonly questionsMapper: QuestionsMapper,
    ) {
    }

    async submitQuiz(
        quizId: Types.ObjectId,
        submitAnswerRequest: SubmitAnswerRequestDto,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<null>> {
        const savedQuiz = await this.quizzesRepository.findQuiz({
            _id: quizId,
        });
        if (!savedQuiz) {
            throw new NotFoundException('Quiz not found');
        }

        const savedSubmission = await this.quizSubmissionsRepository.findSubmission({
            student: new Types.ObjectId(currentUser._id),
            quiz: quizId,
        });
        if (!savedSubmission) {
            throw new ForbiddenException('You must start the quiz before submitting answers');
        }

        if (savedSubmission.status === SubmissionStatus.SUBMITTED) {
            throw new BadRequestException('You have already submitted your answers');
        }

        const now = new Date();
        const quizTotalTimeMs: number = savedQuiz.totalTime * 60 * 1000;
        const gracePeriod: number = 2 * 60 * 1000;

        const expectedEndTime = new Date(savedSubmission.startedAt.getTime() + quizTotalTimeMs + gracePeriod);
        if (now > expectedEndTime) {
            throw new BadRequestException('Time is up! You exceeded the allowed duration for this quiz');
        }

        if (now.getTime() > (savedQuiz.endTime.getTime() + savedQuiz.totalTime * 60 * 1000)) {
            throw new BadRequestException('The quiz time has expired. You cannot submit now');
        }

        const savedQuestions: Question[] = await this.questionsRepository.findAll({quiz: quizId});

        const answers: AnswerDto[] = submitAnswerRequest.answers;
        const {score, questionCorrectnessMap, containsWrittenQuestion} = QuizSubmissionsUtil
            .calculateQuizScore(savedQuestions, answers);

        const userAnswers: UserAnswer[] = QuizSubmissionsUtil
            .buildUserAnswers(savedQuestions, answers, questionCorrectnessMap);

        await this.quizSubmissionsRepository.updateSubmission({
                _id: savedSubmission._id
            },
            {
                $set: {
                    status: SubmissionStatus.SUBMITTED,
                    submittedAt: new Date(),
                    totalScore: score,
                    answers: userAnswers,
                    gradedAt: containsWrittenQuestion ? undefined : new Date(),
                }
            }
        );

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: 'Quiz submitted successfully',
            data: null,
        };

        return appResponse;
    }

    async getQuizSubmissions(
        quizId: Types.ObjectId,
        paginationQuery: PaginationQueryDto
    ): Promise<AppResponseDto<QuizSubmissionResponseDto[]>> {
        const savedQuiz = await this.quizzesRepository.findQuiz({
            _id: quizId
        });
        if (!savedQuiz) {
            throw new NotFoundException('Quiz not found');
        }
        const {page, size} = paginationQuery;
        const skip: number = (page - 1) * size;

        const {submissions, totalElements} = await this.quizSubmissionsRepository
            .findAll({quiz: quizId}, size, skip);

        const appResponse: AppResponseDto<QuizSubmissionResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: submissions.map(this.quizSubmissionsMapper.toQuizSubmissionResponse),
            pagination: constructPagination(totalElements, page, size),
        }

        return appResponse;
    }

    async getSubmissionDetails(submissionId: Types.ObjectId): Promise<AppResponseDto<AnswerDetailsResponseDto[]>> {
        const savedSubmission = await this.quizSubmissionsRepository
            .findSubmissionWithQuestion({_id: submissionId});
        if (!savedSubmission) {
            throw new NotFoundException('Quiz submission not found');
        }

        const answerDetailsResponse: AnswerDetailsResponseDto[] = savedSubmission.answers.map(ans => {
            const question = ans.question as unknown as Question;
            const questionResponse: QuestionResponseDto = this.questionsMapper
                .toQuestionResponse(question, UserRoles.INSTRUCTOR);
            return this.quizSubmissionsMapper.toAnswerDetailsResponse(questionResponse, ans);
        });

        const appResponse: AppResponseDto<AnswerDetailsResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: answerDetailsResponse,
        };

        return appResponse;
    }

    async gradeQuestion(
        submissionId: Types.ObjectId,
        questionId: Types.ObjectId,
        correctWrittenQuestionRequest: CorrectWrittenQuestionRequestDto
    ): Promise<AppResponseDto<null>> {
        const {earnedPoints} = correctWrittenQuestionRequest;
        const savedSubmission = await this.quizSubmissionsRepository.findSubmission({
            _id: submissionId
        });
        if (!savedSubmission) {
            throw new NotFoundException('Quiz submission not found');
        }

        const savedQuestion = await this.questionsRepository.findQuestion({
            _id: questionId,
        });
        if (savedQuestion && earnedPoints > savedQuestion.points) {
            throw new BadRequestException('Earned points cannot be greater than the question points');
        }

        const oldAnswer = savedSubmission.answers.find(a =>
            a.question.toString() === questionId.toString());
        const oldPoints = oldAnswer ? oldAnswer.earnedPoints : 0;

        const pointsDifference = earnedPoints - oldPoints;

        await this.quizSubmissionsRepository.updateSubmission({
                _id: submissionId,
                'answers.question': questionId,
            }, {
                $inc: {totalScore: pointsDifference},
                $set: {
                    'answers.$[elem].isCorrect': earnedPoints > 0,
                    'answers.$[elem].earnedPoints': earnedPoints,
                },
            },
            {
                arrayFilters: [{
                    'elem.question': questionId
                }],
                new: true
            });

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: 'Question graded successfully',
            data: null,
        };

        return appResponse;
    }

}
