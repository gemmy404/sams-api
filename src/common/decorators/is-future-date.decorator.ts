import {registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

@ValidatorConstraint({name: 'isFutureDate', async: false})
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
    validate(value: any) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - 2);
        return value instanceof Date && value > now;
    }
}

export function IsFutureDate(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsFutureDateConstraint,
        });
    };
}