import {IsNotEmpty, IsString, IsStrongPassword} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class ResetPasswordRequestDto {
    @ApiProperty()
    @IsNotEmpty({message: 'Reset token is required'})
    @IsString({message: 'Reset token must be a string'})
    resetToken: string;

    @ApiProperty()
    @IsNotEmpty({message: 'New password is required'})
    @IsStrongPassword({}, {
        message: 'Password is too weak. ' +
            'It must be at least 8 characters long and ' +
            'contain uppercase, lowercase, numbers, and special characters'
    })
    newPassword: string;

    @ApiProperty()
    @IsNotEmpty({message: 'Confirm password is required'})
    @IsStrongPassword({}, {
        message: 'Confirm password is too weak. ' +
            'It must be at least 8 characters long and ' +
            'contain uppercase, lowercase, numbers, and special characters'
    })
    confirmNewPassword: string;
}