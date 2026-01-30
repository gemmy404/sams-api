import {CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException} from "@nestjs/common";
import {CoursesRepository} from "../courses.repository";
import {Request} from "express";
import {CurrentUserDto} from "../../../common/dto/current-user.dto";

@Injectable()
export class IsCourseOwnerGuard implements CanActivate {

    constructor(private readonly coursesRepository: CoursesRepository) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();

        const user: CurrentUserDto = request.user as CurrentUserDto;
        const courseId: string = request.params.courseId as string;

        if (!courseId) {
            throw new ForbiddenException('Course ID is required for this action');
        }

        const savedCourse = await this.coursesRepository.findCourseOwner({
            _id: courseId
        });
        if (!savedCourse) {
            throw new NotFoundException('Course not found');
        }

        const isOwner: boolean = savedCourse.instructor._id.toString() === user._id.toString();
        if (!isOwner) {
            throw new ForbiddenException('You are not authorized to manage this course');
        }

        return true;
    }
}