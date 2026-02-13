import {ApiBearerAuth} from "@nestjs/swagger";
import {Body, Controller, Delete, Param, Patch, Post, UseGuards} from "@nestjs/common";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {RolesGuard} from "../auth/guards/roles.guard";
import {Roles} from "../../common/decorators/roles.decorator";
import {UserRoles} from "../roles/enums/user-roles.enum";
import {AnnouncementsService} from "../announcements/announcements.service";
import {ParseObjectIdPipe} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {CreateAnnouncementRequestDto} from "../announcements/dto/create-announcement-request.dto";
import {IsCourseOwnerGuard} from "../courses/guards/is-course-owner.guard";
import {UpdateAnnouncementRequestDto} from "../announcements/dto/update-announcement-request.dto";
import {AnnouncementResponseDto} from "../announcements/dto/announcement-response.dto";

@ApiBearerAuth('access-token')
@Controller('api/v1/instructor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.INSTRUCTOR)
export class InstructorAnnouncementController {

    constructor(private readonly announcementsService: AnnouncementsService) {
    }

    @Post('courses/:courseId/announcements')
    @UseGuards(IsCourseOwnerGuard)
    createAnnouncement(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
        @Body() createAnnouncementRequest: CreateAnnouncementRequestDto,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<null>> {
        return this.announcementsService.createAnnouncement(courseId, createAnnouncementRequest, currentUser);
    }

    @Patch('announcements/:announcementId')
    updateAnnouncement(
        @Param('announcementId', ParseObjectIdPipe) announcementId: Types.ObjectId,
        @Body() updateAnnouncementRequest: UpdateAnnouncementRequestDto,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<AnnouncementResponseDto>> {
        return this.announcementsService.updateAnnouncement(announcementId, updateAnnouncementRequest, currentUser);
    }

    @Delete('announcements/:announcementId')
    deleteAnnouncement(
        @Param('announcementId', ParseObjectIdPipe) announcementId: Types.ObjectId,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<null>> {
        return this.announcementsService.deleteAnnouncement(announcementId, currentUser);
    }

}