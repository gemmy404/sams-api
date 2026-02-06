import {IsBoolean, IsNotEmpty, IsOptional} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class OptionRequestDto {
    @ApiProperty()
    @IsNotEmpty({message: 'Option text is required'})
    text: string;

    @ApiProperty()
    @IsOptional()
    @IsBoolean({message: 'Is correct must be a boolean'})
    isCorrect: boolean;
}