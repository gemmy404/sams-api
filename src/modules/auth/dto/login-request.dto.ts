import {IsEmail, IsNotEmpty} from "class-validator";

export class LoginRequestDto {
    @IsNotEmpty({message: 'Academic email is required'})
    @IsEmail({}, {message: 'Academic email must be a valid email address'})
    academicEmail: string;

    @IsNotEmpty({message: 'Password is required'})
    password: string;
}