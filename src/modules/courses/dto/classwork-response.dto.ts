import {ApiProperty} from "@nestjs/swagger";

export class ClassworkResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    points: number;

    @ApiProperty()
    isVisible: boolean;
}