import {QuestionType} from "../enums/question-type.enum";
import {ApiProperty} from "@nestjs/swagger";
import {OptionResponseDto} from "./option-response.dto";

export class QuestionResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    text: string;

    @ApiProperty()
    questionType: QuestionType;

    @ApiProperty()
    timeLimit: number;

    @ApiProperty()
    points: number;

    @ApiProperty({type: [OptionResponseDto], required: false})
    options?: OptionResponseDto[];
}