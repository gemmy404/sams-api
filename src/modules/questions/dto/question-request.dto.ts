import {QuestionType} from "../enums/question-type.enum";
import {
    ArrayMaxSize,
    IsArray,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    Min,
    ValidateNested
} from "class-validator";
import {OptionRequestDto} from "./option-request.dto";
import {Type} from "class-transformer";
import {ApiProperty} from "@nestjs/swagger";
import {IsOptionsValid} from "../validators/is-options-valid.validator";

export class QuestionRequestDto {
    @ApiProperty()
    @IsNotEmpty({message: 'Question text is required'})
    text: string;

    @ApiProperty()
    @IsOptional()
    @IsEnum(QuestionType)
    questionType: QuestionType;

    @ApiProperty()
    @IsOptional()
    @IsInt({message: 'Question time limit must be a number'})
    @Min(1, {message: 'Question time limit must be greater than 0'})
    timeLimit: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber({}, {message: 'Points must be a positive integer'})
    @Min(1, {message: 'Points must be greater than 0'})
    points: number;

    @ApiProperty({type: [OptionRequestDto]})
    @IsOptional()
    @IsArray()
    @IsOptionsValid()
    @ArrayMaxSize(10, {message: 'Maximum 10 options are allowed per question'})
    @ValidateNested()
    @Type(() => OptionRequestDto)
    options: OptionRequestDto[];
}