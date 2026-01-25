import {IsEmail, IsEnum, IsNotEmpty} from "class-validator";
import {VerificationType} from "../enums/verification-type.enum";
import {ApiProperty} from "@nestjs/swagger";

export class VerifyCodeRequestDto {
    @ApiProperty()
    @IsNotEmpty({message: 'Code is required'})
    code: string;

    @ApiProperty()
    @IsNotEmpty({message: 'Academic email is required'})
    @IsEmail({}, {message: 'Academic Email must be a valid email address'})
    academicEmail: string;

    @ApiProperty()
    @IsNotEmpty({message: 'Verification Type is required'})
    @IsEnum(VerificationType, {message: 'Verification Type must be one of ACTIVATE_ACCOUNT, PASSWORD_RESET'})
    action: VerificationType
}