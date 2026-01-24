import {IsNotEmpty, Length} from "class-validator";

export class JoinCourseRequestDto {
    @IsNotEmpty({message: 'Course code is required'})
    @Length(6, 6, {message: 'Course code must be equal to 6'})
    courseInvitationCode: string;
}