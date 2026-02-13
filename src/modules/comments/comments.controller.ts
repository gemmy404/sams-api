import {Body, Controller, Delete, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {CommentsService} from './comments.service';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {ParseObjectIdPipe} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {CreateCommentRequestDto} from "./dto/create-comment-request.dto";
import {UpdateCommentRequestDto} from "./dto/update-comment-request.dto";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {CommentResponseDto} from "./dto/comment-response.dto";
import {ApiResponse} from "@nestjs/swagger";

@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class CommentsController {

    constructor(private readonly commentsService: CommentsService) {
    }

    @Post('announcements/:announcementId/comments')
    createComment(
        @Param('announcementId', ParseObjectIdPipe) announcementId: Types.ObjectId,
        @Body() createCommentRequest: CreateCommentRequestDto,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<null>> {
        return this.commentsService.createComment(announcementId, createCommentRequest, currentUser);
    }

    @Patch('comments/:commentId')
    @ApiResponse({type: CommentResponseDto})
    updateComment(
        @Param('commentId', ParseObjectIdPipe) commentId: Types.ObjectId,
        @Body() updateCommentRequestDto: UpdateCommentRequestDto,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<CommentResponseDto>> {
        return this.commentsService.updateComment(commentId, updateCommentRequestDto, currentUser);
    }

    @Delete('comments/:commentId')
    deleteComment(
        @Param('commentId', ParseObjectIdPipe) commentId: Types.ObjectId,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<null>> {
        return this.commentsService.deleteComment(commentId, currentUser);
    }

}
