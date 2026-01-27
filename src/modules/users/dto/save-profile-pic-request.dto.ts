import {IsNotEmpty, MaxLength} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class SaveProfilePicRequestDto {
    @ApiProperty()
    @IsNotEmpty({message: 'Key is required'})
    @MaxLength(50, {message: 'Key must not exceed 50 characters'})
    key: string;
}