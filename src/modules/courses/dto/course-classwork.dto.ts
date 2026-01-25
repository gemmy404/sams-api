import {IsNotEmpty, IsNumber, MaxLength} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class CourseClassworkDto {
    @ApiProperty()
    @IsNotEmpty({message: 'Classwork name is required'})
    @MaxLength(15, {message: 'Classwork name must not exceed 15 characters'})
    name: string;

    @ApiProperty()
    @IsNotEmpty({message: 'Points is required'})
    @IsNumber({}, {message: 'Points must be a number'})
    points: number;
}