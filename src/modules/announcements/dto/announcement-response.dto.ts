import {ApiProperty} from "@nestjs/swagger";

export class AnnouncementResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    content: string;
}