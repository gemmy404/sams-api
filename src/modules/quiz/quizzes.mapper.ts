import {Injectable} from "@nestjs/common";
import {QuizResponseDto} from "./dto/quiz-response.dto";
import {Quiz} from "./schemas/quizzes.schema";

@Injectable()
export class QuizzesMapper {
    toQuizResponse(this: void, quiz: Quiz): QuizResponseDto {
        return {
            _id: quiz._id!.toString(),
            title: quiz.title,
            description: quiz.description || null,
            startTime: quiz.startTime.toLocaleString(),
            endTime: quiz.endTime.toLocaleString(),
            totalTime: quiz.totalTime,
            totalScore: quiz.totalScore,
            numberOfQuestions: quiz.numberOfQuestions,
            isPublished: quiz.isPublished,
        };
    }
}