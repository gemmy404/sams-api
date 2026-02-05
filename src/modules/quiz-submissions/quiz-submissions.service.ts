import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {QuizSubmissionsRepository} from "./quiz-submissions.repository";
import {SubmitAnswerRequestDto} from "./dto/submit-answer-request.dto";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {Types} from "mongoose";
import {QuizzesRepository} from "../quiz/quizzes.repository";
import {SubmissionStatus} from "./enums/submission-status.enum";
import {QuizSubmissionUtils} from "./quiz-submission.utils";
import {QuestionsRepository} from "../questions/questions.repository";
import {AnswerDto} from "./dto/answer.dto";
import {UserAnswer} from "./schemas/user-answers.schema";
import {Question} from "../questions/schemas/questions.schema";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {HttpStatusText} from "../../common/enums/http-status-text.enum";

@Injectable()
export class QuizSubmissionsService {

    constructor(
        private readonly quizSubmissionsRepository: QuizSubmissionsRepository,
        private readonly quizzesRepository: QuizzesRepository,
        private readonly questionsRepository: QuestionsRepository,
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
        const {score, questionCorrectnessMap, containsWrittenQuestion} = QuizSubmissionUtils
            .calculateQuizScore(savedQuestions, answers);

        const userAnswers: UserAnswer[] = QuizSubmissionUtils
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

}
