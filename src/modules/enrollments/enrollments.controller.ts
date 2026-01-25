import {Body, Controller, Delete, Get, Param, Post, UseGuards} from '@nestjs/common';
import {EnrollmentsService} from './enrollments.service';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {JoinCourseRequestDto} from "./dto/join-course-request.dto";
import {RolesGuard} from "../auth/guards/roles.guard";
import {Roles} from "../../common/decorators/roles.decorator";
import {UserRoles} from "../roles/enums/user-roles.enum";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {CourseResponseDto} from "../courses/dto/course-response.dto";
import {ApiBearerAuth, ApiOperation, ApiResponse} from "@nestjs/swagger";

@ApiBearerAuth('access-token')
@Controller('api/v1/enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.STUDENT)
export class EnrollmentsController {

    constructor(private readonly enrollmentsService: EnrollmentsService) {
    }

    @Post()
    @ApiOperation({summary: 'Join to course'})
    joinCourse(
        @Body() joinCourseRequest: JoinCourseRequestDto,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<null>> {
        return this.enrollmentsService.joinCourse(joinCourseRequest, currentUser);
    }

    @Get('me')
    @ApiResponse({type: [CourseResponseDto]})
    @ApiOperation({summary: 'Find my enrollment courses'})
    findMyJoinedCourses(@CurrentUser() currentUser: CurrentUserDto): Promise<AppResponseDto<CourseResponseDto[]>> {
        return this.enrollmentsService.findMyJoinedCourses(currentUser);
    }

    @Delete('courses/:courseId')
    @ApiOperation({summary: 'Unenroll course'})
    unenrollCourse(
        @Param('courseId') courseId: string,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<null>> {
        return this.enrollmentsService.unenrollCourse(courseId, currentUser);
    }

}
