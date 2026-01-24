import {IsNotEmpty, IsNumber, MaxLength, ValidateNested} from "class-validator";
import {CourseClassworkDto} from "./course-classwork.dto";
import {Type} from "class-transformer";

export class CreateCourseRequestDto {
    @IsNotEmpty({message: 'Name is required'})
    @MaxLength(30, {message: 'Name must not exceed 30 characters'})
    name: string;

    @IsNotEmpty({message: 'Academic course code is required'})
    @MaxLength(10, {message: 'Academic course code must not exceed 10 characters'})
    academicCourseCode: string;

    @IsNotEmpty({message: 'Total grade is required'})
    @IsNumber({}, {message: 'Total grades must be a number'})
    totalGrades: number;

    @IsNotEmpty({message: 'Final exam is required'})
    @IsNumber({}, {message: 'Final exam must be a number'})
    finalExam: number;

    @ValidateNested()
    @Type(() => CourseClassworkDto)
    classwork: CourseClassworkDto[];
}