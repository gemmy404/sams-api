import {CourseResponseDto} from "./course-response.dto";
import {ClassworkResponseDto} from "./classwork-response.dto";
import {ApiProperty} from "@nestjs/swagger";

export class CourseDetailsResponseDto extends CourseResponseDto {
    @ApiProperty({type: [ClassworkResponseDto]})
    classwork: ClassworkResponseDto[];
}