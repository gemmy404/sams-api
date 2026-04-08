import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
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
import {ApiBearerAuth, ApiOperation, ApiResponse} from "@nestjs/swagger";
import {Types} from "mongoose";
import {ParseObjectIdPipe} from "@nestjs/mongoose";
import {IsCourseOwnerGuard} from "../courses/guards/is-course-owner.guard";
import {ClassworkResponseDto} from "../courses/dto/classwork-response.dto";
import {CourseDetailsResponseDto} from "../courses/dto/course-details-response.dto";
import {UpdateCourseRequestDto} from "../courses/dto/update-course-request.dto";
import {CourseClassworkDto} from "../courses/dto/course-classwork.dto";
import {CreateUploadUrlResponseDto} from "../s3/dto/create-upload-url-response.dto";
import {UploadMediaItemRequestDto} from "../../common/dto/upload-media-item-request.dto";

@ApiBearerAuth('access-token')
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
        return this.coursesService.createCourse(createCourseRequest, currentUser);
    }

    @Post(':courseId/context/presigned-urls')
    @UseGuards(IsCourseOwnerGuard)
    @ApiResponse({type: [CreateUploadUrlResponseDto]})
    createUploadUrls(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
        @Body() uploadItemRequest: UploadMediaItemRequestDto
    ): Promise<AppResponseDto<CreateUploadUrlResponseDto[]>> {
        return this.coursesService.createUploadUrls(courseId, uploadItemRequest);
    }

    @Get('me')
    @ApiResponse({type: [CourseResponseDto]})
    @ApiOperation({summary: 'Find my created courses'})
    findMyCreatedCourses(@CurrentUser() currentUser: CurrentUserDto): Promise<AppResponseDto<CourseResponseDto[]>> {
        return this.coursesService.findCreatedMyCourse(currentUser);
    }

    @Get(':courseId')
    @UseGuards(IsCourseOwnerGuard)
    @ApiResponse({type: CourseDetailsResponseDto})
    findCourseDetails(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId
    ): Promise<AppResponseDto<CourseDetailsResponseDto>> {
        return this.coursesService.findCourseDetails(courseId);
    }

    @Patch(':courseId')
    @UseGuards(IsCourseOwnerGuard)
    @ApiResponse({type: CourseDetailsResponseDto})
    updateCourse(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
        @Body() updateCourseRequest: UpdateCourseRequestDto
    ): Promise<AppResponseDto<CourseDetailsResponseDto>> {
        return this.coursesService.updateCourse(courseId, updateCourseRequest)
    }

    @Delete(':courseId')
    @UseGuards(IsCourseOwnerGuard)
    deleteCourse(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId
    ): Promise<AppResponseDto<null>> {
        return this.coursesService.deleteCourse(courseId);
    }

    @Post(':courseId/classworks')
    @UseGuards(IsCourseOwnerGuard)
    addClasswork(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
        @Body() classworkRequest: CourseClassworkDto
    ): Promise<AppResponseDto<null>> {
        return this.coursesService.addClasswork(courseId, classworkRequest);
    }

    @Get(':courseId/classworks')
    @UseGuards(IsCourseOwnerGuard)
    @ApiResponse({type: [ClassworkResponseDto]})
    getAvailableClassworks(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId
    ): Promise<AppResponseDto<ClassworkResponseDto[]>> {
        return this.coursesService.getAvailableClassworks(courseId);
    }

    @Patch(':courseId/classworks/:classworkId/toggle-visibility')
    @UseGuards(IsCourseOwnerGuard)
    @ApiResponse({type: ClassworkResponseDto})
    toggleClassworkVisibility(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
        @Param('classworkId', ParseObjectIdPipe) classworkId: Types.ObjectId
    ): Promise<AppResponseDto<ClassworkResponseDto>> {
        return this.coursesService.toggleClassworkVisibility(courseId, classworkId);
    }

    @Delete(':courseId/classworks/:classworkId')
    @UseGuards(IsCourseOwnerGuard)
    deleteClasswork(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
        @Param('classworkId', ParseObjectIdPipe) classworkId: Types.ObjectId
    ): Promise<AppResponseDto<null>> {
        return this.coursesService.deleteClasswork(courseId, classworkId);
    }

}
