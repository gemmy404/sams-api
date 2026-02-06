import {IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class AnswerDto {
    @ApiProperty()
    @IsNotEmpty({message: 'Question id is required'})
    @IsMongoId({message: 'Question id is not a valid ID'})
    questionId: string;

    @ApiProperty()
    @IsOptional()
    @IsMongoId({message: 'Selected option id is not a valid ID'})
    selectedOptionId: string;

    @ApiProperty()
    @IsOptional()
    @IsString({message: 'Written answer must be a string'})
    @MaxLength(2000, {message: 'Maximum length for written answer is 2000'})
    writtenAnswer: string;
}