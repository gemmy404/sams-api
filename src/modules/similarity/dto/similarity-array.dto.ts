import {ApiProperty} from "@nestjs/swagger";

export class SimilarityArrayDto {
    @ApiProperty()
    studentName: string;

    @ApiProperty()
    submissionUrl: string;

    @ApiProperty()
    similarityPercentage: number;
}