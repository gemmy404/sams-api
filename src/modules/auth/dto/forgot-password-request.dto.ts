import {IsEmail, IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class ForgotPasswordRequestDto {
    @ApiProperty()
    @IsNotEmpty({message: 'Academic email is required'})
    @IsEmail({}, {message: 'Academic email must be a valid email address'})
    academicEmail: string;
}