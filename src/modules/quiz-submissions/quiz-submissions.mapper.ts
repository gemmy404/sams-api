import {Injectable} from "@nestjs/common";
import {QuizSubmission} from "./schemas/quiz-submissions.schema";
import {QuizSubmissionResponseDto} from "./dto/quiz-submission-response.dto";
import {Users} from "../users/schemas/users.schema";
import {AnswerDetailsResponseDto} from "./dto/answer-details-response.dto";
import {QuestionResponseDto} from "../questions/dto/question-response.dto";
import {UserAnswer} from "./schemas/user-answers.schema";
import {QuestionType} from "../questions/enums/question-type.enum";

@Injectable()
export class QuizSubmissionsMapper {

    toQuizSubmissionResponse(this: void, quizSubmission: QuizSubmission, totalPoints: number): QuizSubmissionResponseDto {
        const student = quizSubmission.student as unknown as Users;
        return {
            _id: quizSubmission._id!.toString(),
            quizId: quizSubmission.quiz.toString(),
            academicId: student.academicId,
            studentName: student.name,
            score: quizSubmission.totalScore,
            totalPoints: totalPoints,
            submittedAt: quizSubmission.submittedAt.toLocaleString(),
            isGraded: !!quizSubmission.gradedAt,
        };
    }

    toAnswerDetailsResponse(
        this: void,
        questionResponse: QuestionResponseDto,
        answer: UserAnswer
    ): AnswerDetailsResponseDto {
        let selectedOptionId: string | null | undefined = undefined;
        let writtenAnswer: string | null | undefined = undefined;
        if (questionResponse.questionType === QuestionType.WRITTEN) {
            writtenAnswer = answer.writtenAnswer || null;
        } else {
            selectedOptionId = answer.selectedOption?.toString() || null;
        }
        return {
            ...questionResponse,
            selectedOptionId: selectedOptionId,
            writtenAnswer: writtenAnswer,
            earnedPoints: answer.earnedPoints,
            isCorrect: answer.isCorrect,
            isGraded: answer.isGraded,
        }
    }
}