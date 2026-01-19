import {IsEmail, IsNotEmpty, IsStrongPassword, Length, MaxLength, MinLength} from "class-validator";

export class RegisterRequestDto {
    @IsNotEmpty({message: 'Name is required'})
    @MinLength(6, {message: 'Name must be at least 6 characters'})
    @MaxLength(30, {message: 'Name must not be more than 30 characters'})
    name: string;

    @IsNotEmpty({message: 'Academic email is required'})
    @IsEmail({
        host_whitelist: ['o6u.edu.eg']
    }, {message: 'Only academic emails from o6u.edu.eg are permitted'})
    academicEmail: string;

    @IsNotEmpty({message: 'Academic id is required'})
    @Length(9, 9, {message: 'Academic id must be 9 characters'})
    academicId: string;

    @IsNotEmpty({message: 'Password is required'})
    @IsStrongPassword({}, {
        message: 'Password is too weak. ' +
            'It must be at least 8 characters long and ' +
            'contain uppercase, lowercase, numbers, and special characters'
    })
    password: string;

    @IsNotEmpty({message: 'Confirm password is required'})
    @IsStrongPassword({}, {
        message: 'Confirm password is too weak. ' +
            'It must be at least 8 characters long and ' +
            'contain uppercase, lowercase, numbers, and special characters'
    })
    confirmPassword: string;
}