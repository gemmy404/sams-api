import {IsEmail, IsNotEmpty} from "class-validator";

export class VerifyCodeRequestDto {
    @IsNotEmpty({message: 'Code is required'})
    code: string;

    @IsNotEmpty({message: 'Academic email is required'})
    @IsEmail({}, {message: 'Academic Email must be a valid email address'})
    academicEmail: string;
}