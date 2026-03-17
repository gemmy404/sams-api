import {ApiProperty} from "@nestjs/swagger";

export class QuizSubmissionResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    quizId: string;

    @ApiProperty()
    academicId: string;

    @ApiProperty()
    studentName: string;

    @ApiProperty()
    score: number;

    @ApiProperty()
    totalPoints: number;

    @ApiProperty()
    submittedAt: string;

    @ApiProperty()
    isGraded: boolean;
}