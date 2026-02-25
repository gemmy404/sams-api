import {ApiProperty} from "@nestjs/swagger";

export class GradeColumnResponseDto {
    @ApiProperty()
    key: string;

    @ApiProperty()
    name: string;

    @ApiProperty({required: false})
    points?: number;

    @ApiProperty({required: false})
    isVisible?: boolean;
}