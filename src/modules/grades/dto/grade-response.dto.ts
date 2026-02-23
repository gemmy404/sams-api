import {ClassworkResponseDto} from "../../courses/dto/classwork-response.dto";
import {ApiProperty} from "@nestjs/swagger";
import {GradeRowResponseDto} from "./grade-row-response.dto";

export class GradeResponseDto {
    @ApiProperty({type: [ClassworkResponseDto]})
    columns: ClassworkResponseDto[];

    @ApiProperty({type: [GradeRowResponseDto]})
    rows: GradeRowResponseDto[];
}