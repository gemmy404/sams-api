import {PartialType} from "@nestjs/swagger";
import {QuestionRequestDto} from "./question-request.dto";

export class UpdateQuestionRequestDto extends PartialType(QuestionRequestDto) {
}