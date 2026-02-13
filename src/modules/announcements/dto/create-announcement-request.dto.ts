import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, MaxLength, MinLength} from "class-validator";

export class CreateAnnouncementRequestDto {
    @ApiProperty({
        minLength: 3,
        maxLength: 30,
    })
    @IsNotEmpty({message: 'Title is required'})
    @MinLength(3, {message: 'Title must be at least 3 characters long'})
    @MaxLength(30, {message: 'Title cannot be longer than 30 characters'})
    title: string;

    @ApiProperty({
        minLength: 3,
        maxLength: 2000,
    })
    @IsNotEmpty({message: 'Content is required'})
    @MinLength(3, {message: 'Content must be at least 3 characters long'})
    @MaxLength(2000, {message: 'Content cannot be longer than 2000 characters'})
    content: string;
}