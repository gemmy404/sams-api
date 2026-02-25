import {ClassworkResponseDto} from "../../courses/dto/classwork-response.dto";
import {ApiProperty} from "@nestjs/swagger";
import {GradeRowResponseDto} from "./grade-row-response.dto";
import {GradeColumnResponseDto} from "./grade-column-response.dto";

export class GradeResponseDto {
    @ApiProperty({type: [ClassworkResponseDto]})
    columns: GradeColumnResponseDto[];

    @ApiProperty({type: [GradeRowResponseDto]})
    rows: GradeRowResponseDto[];
}