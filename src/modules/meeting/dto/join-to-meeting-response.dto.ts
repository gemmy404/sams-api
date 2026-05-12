import {ApiProperty} from "@nestjs/swagger";

export class JoinToMeetingResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    academicId: string;

    @ApiProperty()
    channelName: string;

    @ApiProperty()
    token: string;

    @ApiProperty({
        description: 'The expiration time of the meeting in min',
    })
    validityPeriod: number;
}