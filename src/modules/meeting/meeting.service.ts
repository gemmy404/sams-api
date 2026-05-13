import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {MeetingRepository} from "./meeting.repository";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {Types} from "mongoose";
import {CoursesRepository} from "../courses/courses.repository";
import {CreateMeetingRequestDto} from "./dto/create-meeting-request.dto";
import {ConfigService} from "@nestjs/config";
import {RtcRole, RtcTokenBuilder} from "agora-token";
import {UsersRepository} from "../users/users.repository";
import {MeetingStatus} from "./enums/meeting-status.enum";
import {InjectQueue} from "@nestjs/bullmq";
import {Queue} from "bullmq";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {HttpStatusText} from "../../common/enums/http-status-text.enum";
import {MeetingMapper} from "./meeting.mapper";
import {MeetingResponseDto} from "./dto/meeting-response.dto";
import {JoinToMeetingResponseDto} from "./dto/join-to-meeting-response.dto";

@Injectable()
export class MeetingService {

    private readonly appId: string;
    private readonly appCertificate: string;

    constructor(
        @InjectQueue('meeting') private readonly meetingQueue: Queue,
        private readonly meetingRepository: MeetingRepository,
        private readonly coursesRepository: CoursesRepository,
        private readonly usersRepository: UsersRepository,
        private readonly meetingMapper: MeetingMapper,
        private readonly configService: ConfigService,
    ) {
        this.appId = this.configService.getOrThrow('AGORA_APP_ID');
        this.appCertificate = this.configService.getOrThrow('AGORA_APP_CERTIFICATE');
    }

    async createMeeting(
        courseId: Types.ObjectId,
        createMeetingRequest: CreateMeetingRequestDto,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<MeetingResponseDto | JoinToMeetingResponseDto>> {
        const savedCourse = await this.coursesRepository.findCourse({
            _id: courseId
        });
        const savedUser = await this.usersRepository.findUser({
            _id: new Types.ObjectId(currentUser._id)
        });

        const channelName = `${savedCourse!.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
        const academicId: number = Number(savedUser!.academicId);

        const status: MeetingStatus = createMeetingRequest.startTime.getTime() > Date.now()
            ? MeetingStatus.SCHEDULED
            : MeetingStatus.ONGOING;

        const createdMeeting = await this.meetingRepository.createMeeting({
            channelName,
            course: savedCourse!._id,
            instructor: savedUser!._id,
            startTime: createMeetingRequest.startTime,
            status: status
        });

        const meetingId: string = createdMeeting._id.toString();

        const appResponse: AppResponseDto<MeetingResponseDto | JoinToMeetingResponseDto> = {
            status: HttpStatusText.SUCCESS,
            message: 'Meeting created successfully',
            data: this.meetingMapper.toMeetingResponse(createdMeeting),
        }

        if (status === MeetingStatus.SCHEDULED) {
            const delay: number = createdMeeting.startTime.getTime() - Date.now();
            await this.meetingQueue.add(
                'start-meeting',
                {
                    meetingId,
                    channelName
                },
                {
                    delay: delay > 0 ? delay : 0,
                    attempts: 3,
                    jobId: meetingId,
                    backoff: 5000,
                    removeOnComplete: true,
                }
            );

            return appResponse;
        }

        const token: string = this.getToken(channelName, academicId);
        appResponse.data = {
            _id: meetingId,
            academicId: savedUser!.academicId,
            channelName: channelName,
            token: token,
            validityPeriod: 120,
        }
        return appResponse;
    }

    async getAllMeetings(courseId: Types.ObjectId): Promise<AppResponseDto<MeetingResponseDto[]>> {
        const savedCourse = await this.coursesRepository.findCourse({
            _id: courseId
        });
        if (!savedCourse) {
            throw new NotFoundException('Course not found');
        }

        const savedMeetings = await this.meetingRepository.findAllMeetings({
            course: courseId,
        });

        const appResponse: AppResponseDto<MeetingResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: savedMeetings.map(this.meetingMapper.toMeetingResponse),
        };

        return appResponse;
    }

    async joinToMeeting(
        meetingId: Types.ObjectId,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<JoinToMeetingResponseDto>> {
        const savedMeeting = await this.meetingRepository.findMeeting({
            _id: meetingId
        });
        if (!savedMeeting) {
            throw new NotFoundException('Meeting not found');
        }

        if (savedMeeting.startTime.getTime() > Date.now()) {
            throw new BadRequestException('Meeting has not started yet');
        }

        if (savedMeeting.status === MeetingStatus.ENDED) {
            throw new BadRequestException('Meeting has already ended');
        }

        const savedUser = await this.usersRepository.findUser({
            _id: new Types.ObjectId(currentUser._id)
        });

        const channelName: string = savedMeeting.channelName;

        const academicId: number = Number(savedUser!.academicId);
        const token: string = this.getToken(channelName, academicId);

        const appResponse: AppResponseDto<JoinToMeetingResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: {
                _id: savedMeeting._id.toString(),
                academicId: `${academicId}`,
                channelName,
                token,
                validityPeriod: 120,
            },
        };

        return appResponse;
    }

    async changeStatus(meetingId: Types.ObjectId, newVal: {
        newStatus: MeetingStatus,
        endTime?: Date
    }): Promise<AppResponseDto<MeetingResponseDto>> {
        const updatedMeeting = await this.meetingRepository
            .changeStatus(new Types.ObjectId(meetingId), newVal);
        if (!updatedMeeting) {
            throw new NotFoundException('Meeting not found');
        }

        const appResponse: AppResponseDto<MeetingResponseDto> = {
            status: HttpStatusText.SUCCESS,
            message: 'Meeting status updated successfully',
            data: this.meetingMapper.toMeetingResponse(updatedMeeting),
        };

        return appResponse;
    }

    async deleteMeeting(meetingId: Types.ObjectId, currentUser: CurrentUserDto): Promise<AppResponseDto<null>> {
        const savedMeeting = await this.meetingRepository.findMeeting({
            _id: meetingId
        });
        if (!savedMeeting) {
            throw new NotFoundException('Meeting not found');
        }

        if (savedMeeting.instructor.toString() !== currentUser._id) {
            throw new ForbiddenException('You are not authorized to delete this meeting');
        }

        await this.meetingRepository.deleteMeeting(savedMeeting._id);

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: 'Meeting deleted successfully',
            data: null,
        };

        return appResponse;
    }

    private getToken(channelName: string, academicId: number): string {
        const expirationInSeconds: number = 3600 * 2;
        const currentTimestamp: number = Math.floor(Date.now() / 1000);

        const tokenExpire: number = currentTimestamp + expirationInSeconds;
        const privilegeExpire: number = currentTimestamp + expirationInSeconds;

        return RtcTokenBuilder.buildTokenWithUid(
            this.appId,
            this.appCertificate,
            channelName,
            academicId,
            RtcRole.PUBLISHER,
            tokenExpire,
            privilegeExpire,
        );
    }
}
