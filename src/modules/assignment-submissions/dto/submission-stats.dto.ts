import {ApiProperty} from "@nestjs/swagger";

export class SubmissionStatsDto {
    @ApiProperty()
    submitted: number;

    @ApiProperty()
    marked: number;

    @ApiProperty()
    unmarked: number;
}