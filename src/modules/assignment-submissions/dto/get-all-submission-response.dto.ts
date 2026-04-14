import {ApiProperty} from "@nestjs/swagger";
import {SubmissionResponseDto} from "./submission-response.dto";
import {SubmissionStatsDto} from "./submission-stats.dto";

export class GetAllSubmissionResponseDto {
    @ApiProperty({type: SubmissionStatsDto})
    stats: SubmissionStatsDto;

    @ApiProperty({type: [SubmissionResponseDto]})
    submissions: SubmissionResponseDto[];
}