import {IsEmail, IsNotEmpty, Length, MaxLength, MinLength} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class BaseUserRequestDto {
    @ApiProperty()
    @IsNotEmpty({message: 'Name is required'})
    @MinLength(6, {message: 'Name must be at least 6 characters'})
    @MaxLength(30, {message: 'Name must not be more than 30 characters'})
    name: string;

    @ApiProperty()
    @IsNotEmpty({message: 'Academic email is required'})
    @IsEmail({
        host_whitelist: ['o6u.edu.eg']
    }, {message: 'Only academic emails from o6u.edu.eg are permitted'})
    academicEmail: string;

    @ApiProperty()
    @IsNotEmpty({message: 'Academic id is required'})
    @Length(9, 9, {message: 'Academic id must be 9 characters'})
    academicId: string;
}
