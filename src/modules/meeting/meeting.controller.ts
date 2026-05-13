import {Controller, Get, Param, Post, UseGuards} from '@nestjs/common';
import {MeetingService} from './meeting.service';
import {Types} from "mongoose";
import {ParseObjectIdPipe} from "@nestjs/mongoose";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {MeetingResponseDto} from "./dto/meeting-response.dto";
import {JoinToMeetingResponseDto} from "./dto/join-to-meeting-response.dto";
import {ApiResponse} from "@nestjs/swagger";
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";

@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class MeetingController {

    constructor(private readonly meetingService: MeetingService) {
    }

    @Get('courses/:courseId/meetings')
    @ApiResponse({type: [MeetingResponseDto]})
    getAllMeetings(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
    ): Promise<AppResponseDto<MeetingResponseDto[]>> {
        return this.meetingService.getAllMeetings(courseId)
    }

    @Post('meetings/:meetingId/join')
    joinToMeeting(
        @Param('meetingId', ParseObjectIdPipe) meetingId: Types.ObjectId,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<JoinToMeetingResponseDto>> {
        return this.meetingService.joinToMeeting(meetingId, currentUser);
    }

}
