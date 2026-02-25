import {ApiProperty} from "@nestjs/swagger";

export class MyGradeResponseDto {
    @ApiProperty()
    classwork: string;

    @ApiProperty()
    score: number;

    @ApiProperty()
    maxScore: number;
}