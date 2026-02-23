import {ApiProperty} from "@nestjs/swagger";

export class UserGradeResponseDto {
    @ApiProperty()
    academicId: string;

    @ApiProperty()
    name: string;
}