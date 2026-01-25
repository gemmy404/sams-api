import {IsEmail, IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class LoginRequestDto {
    @ApiProperty()
    @IsNotEmpty({message: 'Academic email is required'})
    @IsEmail({}, {message: 'Academic email must be a valid email address'})
    academicEmail: string;

    @ApiProperty()
    @IsNotEmpty({message: 'Password is required'})
    password: string;
}