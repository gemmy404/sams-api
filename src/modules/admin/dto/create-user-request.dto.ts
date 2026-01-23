import {BaseUserRequestDto} from "../../../common/dto/base-user-request.dto";
import {IsNotEmpty, IsStrongPassword, MaxLength, MinLength} from "class-validator";

export class CreateUserRequestDto extends BaseUserRequestDto {
    @IsNotEmpty({message: 'Role ID is required'})
    roleId: string;

    @IsNotEmpty({message: 'Password is required'})
    @MinLength(8, {message: 'Password must be at least 8 characters'})
    @MaxLength(16, {message: 'Password must be not greater than 16 characters'})
    @IsStrongPassword({}, {
        message: 'Password is too weak. It must be contain uppercase, lowercase, numbers, and special characters'
    })
    password: string;
}