import {Body, Controller, Delete, Param, Patch, Post, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiExtraModels, ApiResponse, getSchemaPath} from "@nestjs/swagger";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {RolesGuard} from "../auth/guards/roles.guard";
import {Roles} from "../../common/decorators/roles.decorator";
import {UserRoles} from "../roles/enums/user-roles.enum";
import {MeetingService} from "../meeting/meeting.service";
import {IsCourseOwnerGuard} from "../courses/guards/is-course-owner.guard";
import {Types} from "mongoose";
import {ParseObjectIdPipe} from "@nestjs/mongoose";
import {CreateMeetingRequestDto} from "../meeting/dto/create-meeting-request.dto";
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {MeetingResponseDto} from "../meeting/dto/meeting-response.dto";
import {JoinToMeetingResponseDto} from "../meeting/dto/join-to-meeting-response.dto";
import {MeetingStatus} from "../meeting/enums/meeting-status.enum";

@ApiBearerAuth('access-token')
@Controller('api/v1/instructor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.INSTRUCTOR)
export class InstructorMeetingController {

    constructor(private readonly meetingsService: MeetingService) {
    }

    @Post('courses/:courseId/meetings')
    @UseGuards(IsCourseOwnerGuard)
    @ApiExtraModels(MeetingResponseDto, JoinToMeetingResponseDto)
    @ApiResponse({
        schema: {
            oneOf: [
                {$ref: getSchemaPath(MeetingResponseDto)},
                {$ref: getSchemaPath(JoinToMeetingResponseDto)},
            ],
        }
    })
    createMeeting(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
        @Body() createMeetingRequest: CreateMeetingRequestDto,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<MeetingResponseDto | JoinToMeetingResponseDto>> {
        return this.meetingsService.createMeeting(courseId, createMeetingRequest, currentUser);
    }

    @Patch('meetings/:meetingId/end-meeting')
    @ApiResponse({type: MeetingResponseDto})
    endMeeting(
        @Param('meetingId', ParseObjectIdPipe) meetingId: Types.ObjectId,
    ): Promise<AppResponseDto<MeetingResponseDto>> {
        return this.meetingsService.changeStatus(meetingId, {newStatus: MeetingStatus.ENDED, endTime: new Date()});
    }

    @Delete('meetings/:meetingId')
    deleteMeeting(
        @Param('meetingId', ParseObjectIdPipe) meetingId: Types.ObjectId,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<null>> {
        return this.meetingsService.deleteMeeting(meetingId, currentUser);
    }

}