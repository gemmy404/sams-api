import {AnswerDto} from "./dto/answer.dto";
import {Question} from "../questions/schemas/questions.schema";
import {QuestionType} from "../questions/enums/question-type.enum";
import {Option} from "../questions/schemas/options.schema";
import {Types} from "mongoose";
import {UserAnswer} from "./schemas/user-answers.schema";

export class QuizSubmissionUtils {

    static calculateQuizScore(savedQuestions: Question[], answers: AnswerDto[]) {
        let score: number = 0, containsWrittenQuestion: boolean = false;
        const questionCorrectnessMap = new Map<string, { isCorrect: boolean, earnedPoints: number } | undefined>();

        const answersMap = new Map(
            answers.map((ans: AnswerDto) => [ans.questionId, ans])
        );

        for (const question of savedQuestions) {
            const qid: string = question._id!.toString();

            if (question.questionType === QuestionType.WRITTEN) {
                containsWrittenQuestion = true;
                questionCorrectnessMap.set(qid, undefined);
                continue;
            }

            const answer: AnswerDto | undefined = answersMap.get(qid);
            if (!answer || !answer.selectedOptionId) {
                questionCorrectnessMap.set(qid, {isCorrect: false, earnedPoints: question.points});
                continue;
            }

            const isCorrect: boolean = question.options!.some(
                (opt: Option) => opt._id!.toString() === answer.selectedOptionId && opt.isCorrect
            );
            const earnedPoints: number = isCorrect ? question.points : 0;
            if (isCorrect) {
                score += earnedPoints;
            }

            questionCorrectnessMap.set(qid, {isCorrect, earnedPoints});
        }

        return {score, questionCorrectnessMap, containsWrittenQuestion};
    }

    static buildUserAnswers(
        savedQuestions: Question[],
        answers: AnswerDto[],
        questionCorrectnessMap: Map<string, { isCorrect: boolean, earnedPoints: number } | undefined>
    ): UserAnswer[] {
        const answersMap = new Map(answers.map(ans => [ans.questionId.toString(), ans]));

        return savedQuestions.map(question => {
            const qid: string = question._id!.toString();
            const answer: AnswerDto | undefined = answersMap.get(qid);
            const correctness = questionCorrectnessMap.get(qid);

            return {
                question: question._id!,
                selectedOption: answer?.selectedOptionId ? new Types.ObjectId(answer.selectedOptionId) : undefined,
                writtenAnswer: answer?.writtenAnswer || undefined,
                isCorrect: correctness?.isCorrect,
                earnedPoints: correctness?.earnedPoints || 0,
            };
        });
    }
}