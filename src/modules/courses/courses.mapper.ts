import {Injectable} from "@nestjs/common";
import {Course} from "./schemas/courses.schema";
import {CourseResponseDto} from "./dto/course-response.dto";
import {Users} from "../users/schemas/users.schema";

@Injectable()
export class CoursesMapper {

    toCourseResponse(this: void, course: Course): CourseResponseDto {
        const instructor = course.instructor as unknown as Users;
        return {
            _id: course._id.toString(),
            name: course.name,
            academicCourseCode: course.academicCourseCode,
            courseInvitationCode: course.courseInvitationCode,
            instructor: instructor.name
        };
    }

}