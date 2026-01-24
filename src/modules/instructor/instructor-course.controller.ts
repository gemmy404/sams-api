import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
import {CoursesService} from '../courses/courses.service';
import {CreateCourseRequestDto} from "../courses/dto/create-course-request.dto";
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {CourseResponseDto} from "../courses/dto/course-response.dto";
import {Roles} from "../../common/decorators/roles.decorator";
import {UserRoles} from "../roles/enums/user-roles.enum";
import {RolesGuard} from "../auth/guards/roles.guard";

@Controller('api/v1/instructor/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.INSTRUCTOR)
export class InstructorCourseController {

    constructor(private readonly coursesService: CoursesService) {
    }

    @Post()
    createCourse(
        @Body() createCourseRequest: CreateCourseRequestDto,
        @CurrentUser() currentUser: CurrentUserDto,
    ): Promise<AppResponseDto<null>> {
        return this.coursesService.createCourse(createCourseRequest,currentUser);
    }

    @Get('me')
    findMyCreatedCourses(@CurrentUser() currentUser: CurrentUserDto): Promise<AppResponseDto<CourseResponseDto[]>> {
        return this.coursesService.findCreatedMyCourse(currentUser);
    }

}
