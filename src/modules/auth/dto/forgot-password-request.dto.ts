import {IsEmail, IsNotEmpty} from "class-validator";

export class ForgotPasswordRequestDto {
    @IsNotEmpty({message: 'Academic email is required'})
    @IsEmail({}, {message: 'Academic email must be a valid email address'})
    academicEmail: string;
}