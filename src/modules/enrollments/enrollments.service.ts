import {ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import {EnrollmentsRepository} from "./enrollments.repository";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {JoinCourseRequestDto} from "./dto/join-course-request.dto";
import {CoursesRepository} from "../courses/courses.repository";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {HttpStatusText} from "../../common/enums/http-status-text.enum";
import {CourseResponseDto} from "../courses/dto/course-response.dto";
import {CoursesMapper} from "../courses/courses.mapper";
import {Course} from "../courses/schemas/courses.schema";

@Injectable()
export class EnrollmentsService {

    constructor(
        private readonly enrollmentsRepository: EnrollmentsRepository,
        private readonly coursesRepository: CoursesRepository,
        private readonly coursesMapper: CoursesMapper,
    ) {
    }

    async joinCourse(joinCourseRequest: JoinCourseRequestDto, currentUser: CurrentUserDto): Promise<AppResponseDto<null>> {
        const savedCourse = await this.coursesRepository.findCourse({
            courseInvitationCode: joinCourseRequest.courseInvitationCode
        });
        if (!savedCourse) {
            throw new NotFoundException(`No course found with code: ${joinCourseRequest.courseInvitationCode}`);
        }

        const isAlreadyEnrolled = await this.enrollmentsRepository
            .findByUserIdAndCourseId(currentUser._id, savedCourse._id.toString());
        if (isAlreadyEnrolled) {
            throw new ConflictException('You are already enrolled in this course');
        }

        await this.enrollmentsRepository.create({
            user: currentUser._id,
            course: savedCourse._id.toString(),
        });

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: `Successfully joined "${savedCourse.name}"`,
            data: null,
        };

        return appResponse;
    }

    async findMyJoinedCourses(currentUser: CurrentUserDto): Promise<AppResponseDto<CourseResponseDto[]>> {
        const enrollments = await this.enrollmentsRepository.findAll({
            user: currentUser._id
        }, 'enrolledAt');

        const appResponse: AppResponseDto<CourseResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: enrollments.map(enrollment =>
                this.coursesMapper.toCourseResponse(enrollment.course as unknown as Course)
            ),
        };

        return appResponse;
    }

    async unenrollCourse(courseId: string, currentUser: CurrentUserDto): Promise<AppResponseDto<null>> {
        const deletedEnrollment = await this.enrollmentsRepository
            .deleteByUserIdAndCourseId(currentUser._id, courseId)
        if (!deletedEnrollment.deletedCount) {
            throw new NotFoundException('You are not enrolled in this course or it does not exist');
        }

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: 'You have successfully unenrolled from the course',
            data: null,
        };

        return appResponse;
    }

}
