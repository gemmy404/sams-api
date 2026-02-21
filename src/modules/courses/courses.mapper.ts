import {Injectable} from "@nestjs/common";
import {Course} from "./schemas/courses.schema";
import {CourseResponseDto} from "./dto/course-response.dto";
import {Users} from "../users/schemas/users.schema";
import {Classwork} from "./schemas/classwork.schema";
import {ClassworkResponseDto} from "./dto/classwork-response.dto";

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

    toClassworkResponse(this: void, classwork: Classwork): ClassworkResponseDto {
        return {
            _id: classwork._id!.toString(),
            name: classwork.name,
            points: classwork.points,
            isVisible: classwork.isVisible
        }
    }

}