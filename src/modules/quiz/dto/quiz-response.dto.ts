import {ApiProperty} from "@nestjs/swagger";

export class QuizResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string | null;

    @ApiProperty({
        description: 'The date and time when the quiz becomes available and students are allowed to start the quiz',
    })
    startTime: Date;

    @ApiProperty({
        description: 'The last date and time when students are allowed to enter and start the quiz',
    })
    endTime: Date;

    @ApiProperty({
        description: 'The total allowed time (in minutes) to complete the quiz once the student starts answering',
    })
    totalTime: number;

    @ApiProperty()
    totalScore: number;

    @ApiProperty()
    numberOfQuestions: number;

    @ApiProperty()
    isPublished: boolean;
}