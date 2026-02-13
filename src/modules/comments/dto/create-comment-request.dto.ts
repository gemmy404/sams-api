import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, MaxLength, MinLength} from "class-validator";

export class CreateCommentRequestDto {
    @ApiProperty({
        minLength: 1,
        maxLength: 1500,
    })
    @IsNotEmpty({message: 'Content is required'})
    @MinLength(1, {message: 'Content must be at least 1 characters long'})
    @MaxLength(1500, {message: 'Content cannot be longer than 1500 characters'})
    content: string;
}