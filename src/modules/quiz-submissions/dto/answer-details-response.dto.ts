import {QuestionResponseDto} from "../../questions/dto/question-response.dto";
import {ApiProperty} from "@nestjs/swagger";

export class AnswerDetailsResponseDto extends QuestionResponseDto {
    @ApiProperty({required: false})
    selectedOptionId?: string | null;

    @ApiProperty({required: false})
    writtenAnswer?: string | null;

    @ApiProperty()
    earnedPoints: number;

    @ApiProperty({required: false})
    isCorrect?: boolean | null;
}