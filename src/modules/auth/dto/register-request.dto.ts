import {IsNotEmpty, IsStrongPassword, MaxLength, MinLength} from "class-validator";

import {BaseUserRequestDto} from "../../../common/dto/base-user-request.dto";

export class RegisterRequestDto extends BaseUserRequestDto {
    @IsNotEmpty({message: 'Password is required'})
    @MinLength(8, {message: 'Password must be at least 8 characters'})
    @MaxLength(16, {message: 'Password must be not greater than 16 characters'})
    @IsStrongPassword({}, {
        message: 'Password is too weak. It must be contain uppercase, lowercase, numbers, and special characters'
    })
    password: string;

    @IsNotEmpty({message: 'Confirm password is required'})
    @MinLength(8, {message: 'Confirm password must be at least 8 characters'})
    @MaxLength(16, {message: 'Confirm password must be not greater than 16 characters'})
    @IsStrongPassword({}, {
        message: 'Confirm password is too weak. It must be contain uppercase, lowercase, numbers, and special characters'
    })
    confirmPassword: string;
}