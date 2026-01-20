import {IsNotEmpty, IsString, IsStrongPassword} from "class-validator";

export class ResetPasswordRequestDto {
    @IsNotEmpty({message: 'Reset token is required'})
    @IsString({message: 'Reset token must be a string'})
    resetToken: string;

    @IsNotEmpty({message: 'New password is required'})
    @IsStrongPassword({}, {
        message: 'Password is too weak. ' +
            'It must be at least 8 characters long and ' +
            'contain uppercase, lowercase, numbers, and special characters'
    })
    newPassword: string;

    @IsNotEmpty({message: 'Confirm password is required'})
    @IsStrongPassword({}, {
        message: 'Confirm password is too weak. ' +
            'It must be at least 8 characters long and ' +
            'contain uppercase, lowercase, numbers, and special characters'
    })
    confirmNewPassword: string;
}