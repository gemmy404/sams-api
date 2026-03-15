import {UserGradeResponseDto} from "./user-grade-response.dto";
import {ApiProperty} from "@nestjs/swagger";

export class GradeRowResponseDto {
    @ApiProperty({type: UserGradeResponseDto})
    student: UserGradeResponseDto;

    @ApiProperty({
        type: Map<string, number>,
        description: 'Map of classworkId -> grade',
        example: {"cw_id": 20}
    })
    grades: Record<string, number | null>;
}
