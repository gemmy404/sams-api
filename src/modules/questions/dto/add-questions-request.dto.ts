import {QuestionRequestDto} from "./question-request.dto";
import {ApiProperty} from "@nestjs/swagger";
import {ArrayMaxSize, IsArray, ValidateNested} from "class-validator";
import {Type} from "class-transformer";

export class AddQuestionsRequestDto {
    @ApiProperty({type: [QuestionRequestDto]})
    @IsArray()
    @ArrayMaxSize(150, {message: 'The maximum limit for questions per quiz is 150'})
    @ValidateNested()
    @Type(() => QuestionRequestDto)
    questions: QuestionRequestDto[];
}