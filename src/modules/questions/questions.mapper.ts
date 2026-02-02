import {Injectable} from "@nestjs/common";
import {QuestionResponseDto} from "./dto/question-response.dto";
import {Question} from "./schemas/questions.schema";
import {Option} from "./schemas/options.schema";
import {UserRoles} from "../roles/enums/user-roles.enum";
import {OptionResponseDto} from "./dto/option-response.dto";

@Injectable()
export class QuestionsMapper {
    toQuestionResponse(question: Question, userRole: UserRoles): QuestionResponseDto {
        const optionResponse: OptionResponseDto[] | undefined = question.options?.map(option =>
            this.toOptionResponse(option, userRole));

        return {
            _id: question._id!.toString(),
            text: question.text,
            questionType: question.questionType,
            timeLimit: question.timeLimit,
            points: question.points,
            options: optionResponse,
        };
    }

    private toOptionResponse(option: Option, userRole: UserRoles): OptionResponseDto {
        return {
            _id: option._id!.toString(),
            text: option.text,
            isCorrect: userRole === UserRoles.INSTRUCTOR ? option.isCorrect : undefined
        }
    }
}