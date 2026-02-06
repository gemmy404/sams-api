import {ArrayMaxSize, IsArray, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {AnswerDto} from "./answer.dto";
import {ApiProperty} from "@nestjs/swagger";

export class SubmitAnswerRequestDto {
    @ApiProperty({type: [AnswerDto]})
    @IsArray()
    @ArrayMaxSize(150, {message: 'The maximum limit for answers per quiz is 150'})
    @ValidateNested()
    @Type(() => AnswerDto)
    answers: AnswerDto[];
}