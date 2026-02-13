import {ApiProperty} from "@nestjs/swagger";
import {CommentResponseDto} from "../../comments/dto/comment-response.dto";

export class AnnouncementResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    content: string;

    @ApiProperty({type: [CommentResponseDto], required: false})
    comments?: CommentResponseDto[];
}