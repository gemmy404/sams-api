import {ApiProperty} from "@nestjs/swagger";
import {CommentAuthorDto} from "./comment-author.dto";

export class CommentResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    content: string;

    @ApiProperty()
    commentedAt: string;

    @ApiProperty({type: CommentAuthorDto})
    author: CommentAuthorDto
}