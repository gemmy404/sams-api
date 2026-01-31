export class QuizResponseDto {
    _id: string;
    title: string;
    description: string | null;
    startTime: Date;
    endTime: Date;
    totalTime: number;
    totalScore: number;
    numberOfQuestions: number;
}