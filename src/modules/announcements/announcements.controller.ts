import {Controller, Get, Param, UseGuards} from '@nestjs/common';
import {AnnouncementsService} from './announcements.service';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {Types} from "mongoose";
import {ParseObjectIdPipe} from "@nestjs/mongoose";
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {AnnouncementResponseDto} from "./dto/announcement-response.dto";
import {ApiResponse} from "@nestjs/swagger";

@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class AnnouncementsController {

    constructor(private readonly announcementsService: AnnouncementsService) {
    }

    @Get('courses/:courseId/announcements')
    @ApiResponse({type: [AnnouncementResponseDto]})
    getAllAnnouncements(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<AnnouncementResponseDto[]>> {
        return this.announcementsService.getAllAnnouncements(courseId, currentUser);
    }

    @Get('announcements/:announcementId')
    @ApiResponse({type: AnnouncementResponseDto})
    getAnnouncementDetails(
        @Param('announcementId', ParseObjectIdPipe) announcementId: Types.ObjectId,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<AnnouncementResponseDto>> {
        return this.announcementsService.getAnnouncementDetails(announcementId, currentUser);
    }
}
