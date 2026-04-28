import {ApiProperty} from "@nestjs/swagger";
import {SimilarityArrayDto} from "./similarity-array.dto";

export class SimilarityReportResponseDto {
    @ApiProperty({description: 'Plagiarism Threshold in percentage'})
    assignmentPlagiarismThreshold: number;

    @ApiProperty()
    studentName: string;

    @ApiProperty({type: [SimilarityArrayDto]})
    similarities: SimilarityArrayDto[];
}