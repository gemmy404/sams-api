import {ApiProperty, PartialType} from "@nestjs/swagger";
import {CreateCourseRequestDto} from "./create-course-request.dto";
import {UpdateCourseClassworkDto} from "./update-course-classwork.dto";
import {IsOptional, ValidateNested} from "class-validator";
import {Type} from "class-transformer";

export class UpdateCourseRequestDto extends PartialType(CreateCourseRequestDto) {
    @IsOptional()
    @ApiProperty({type: [UpdateCourseClassworkDto]})
    @ValidateNested()
    @Type(() => UpdateCourseClassworkDto)
    classwork: UpdateCourseClassworkDto[];
}