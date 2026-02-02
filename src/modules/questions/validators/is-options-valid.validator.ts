import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import {QuestionType} from '../enums/question-type.enum';
import {QuestionRequestDto} from "../dto/question-request.dto";

@ValidatorConstraint({name: 'isOptionsRequiredByType', async: false})
export class IsOptionsRequiredConstraint implements ValidatorConstraintInterface {

    validate(options: any, args: ValidationArguments): boolean {
        const question = args.object as QuestionRequestDto;
        const type: QuestionType = question.questionType;

        if (type === QuestionType.MCQ || type === QuestionType.TRUE_FALSE) {
            return Array.isArray(options) && options.length >= 2;
        }

        if (type === QuestionType.WRITTEN) {
            return options === undefined || (Array.isArray(options) && options.length === 0);
        }

        return true;
    }

    defaultMessage(args: ValidationArguments): string {
        const question = args.object as QuestionRequestDto;
        if (question.questionType === QuestionType.MCQ || question.questionType === QuestionType.TRUE_FALSE) {
            return 'MCQ and TRUE/FALSE questions must have at least 2 options';
        }
        return 'Written questions should not have any options';
    }
}

export function IsOptionsValid(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsOptionsRequiredConstraint,
        });
    };
}