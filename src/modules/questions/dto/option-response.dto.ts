import {ApiProperty} from "@nestjs/swagger";

export class OptionResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    text: string;

    @ApiProperty({required: false})
    isCorrect?: boolean;
}