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

    toQuizSubmissionResponse(this: void, quizSubmission: QuizSubmission): QuizSubmissionResponseDto {
        const student = quizSubmission.student as unknown as Users;
        return {
            _id: quizSubmission._id!.toString(),
            quizId: quizSubmission.quiz.toString(),
            academicId: student.academicId,
            studentName: student.name,
            score: quizSubmission.totalScore,
            submittedAt: quizSubmission.submittedAt.toLocaleString(),
        };
    }

    toAnswerDetailsResponse(
        this: void,
        questionResponse: QuestionResponseDto,
        answer: UserAnswer
    ): AnswerDetailsResponseDto {
        let selectedOptionId: string | null | undefined = undefined;
        let writtenAnswer: string | null | undefined = undefined;
        let isCorrect: boolean | null;
        if (questionResponse.questionType === QuestionType.WRITTEN) {
            writtenAnswer = answer.writtenAnswer || null;
            isCorrect = writtenAnswer === null ? false : null;
        } else {
            selectedOptionId = answer.selectedOption?.toString() || null;
            isCorrect = !selectedOptionId ? false : answer.isCorrect!;
        }
        return {
            ...questionResponse,
            selectedOptionId: selectedOptionId,
            writtenAnswer: writtenAnswer,
            earnedPoints: answer.earnedPoints,
            isCorrect: isCorrect,
        }
    }
}