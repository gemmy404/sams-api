import {ApiProperty} from "@nestjs/swagger";

export class CourseResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    academicCourseCode: string;

    @ApiProperty()
    courseInvitationCode?: string;

    @ApiProperty()
    instructor: string;
}