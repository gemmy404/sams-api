import {IsMongoId, IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {CourseClassworkDto} from "./course-classwork.dto";

export class UpdateCourseClassworkDto extends CourseClassworkDto {
    @ApiProperty()
    @IsNotEmpty({message: 'Classwork id is required'})
    @IsMongoId({message: 'Classwork id must be a valid mongo id'})
    _id: string;
}