import {IsNotEmpty, IsNumber, MaxLength} from "class-validator";

export class CourseClassworkDto {
    @IsNotEmpty({message: 'Classwork name is required'})
    @MaxLength(15, {message: 'Classwork name must not exceed 15 characters'})
    name: string;

    @IsNotEmpty({message: 'Points is required'})
    @IsNumber({}, {message: 'Points must be a number'})
    points: number;
}