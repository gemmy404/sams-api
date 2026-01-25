import {IsNotEmpty, Length} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class JoinCourseRequestDto {
    @ApiProperty()
    @IsNotEmpty({message: 'Course code is required'})
    @Length(6, 6, {message: 'Course code must be equal to 6'})
    courseInvitationCode: string;
}