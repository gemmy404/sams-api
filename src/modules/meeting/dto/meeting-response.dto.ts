import {ApiProperty} from "@nestjs/swagger";
import {MeetingStatus} from "../enums/meeting-status.enum";

export class MeetingResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty({description: 'The unique channel name for Agora'})
    channelName: string;

    @ApiProperty()
    startTime: string;

    @ApiProperty({nullable: true})
    endTime: string | null;

    @ApiProperty({
        description: 'The duration of the meeting in minutes',
        example: '60 mins',
        default: 0,
    })
    duration: number;

    @ApiProperty({
        enum: MeetingStatus,
    })
    status: MeetingStatus;
}