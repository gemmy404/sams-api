import {ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {CommentsRepository} from "./comments.repository";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {Types} from "mongoose";
import {CreateCommentRequestDto} from "./dto/create-comment-request.dto";
import {AnnouncementsRepository} from "../announcements/announcements.repository";
import {MaterialsService} from "../materials/materials.service";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {HttpStatusText} from "../../common/enums/http-status-text.enum";
import {CommentResponseDto} from "./dto/comment-response.dto";
import {CommentsMapper} from "./comments.mapper";
import {UpdateCommentRequestDto} from "./dto/update-comment-request.dto";

@Injectable()
export class CommentsService {

    constructor(
        private readonly commentsRepository: CommentsRepository,
        private readonly announcementsRepository: AnnouncementsRepository,
        private readonly commentsMapper: CommentsMapper,
        private readonly materialsService: MaterialsService,
    ) {
    }

    async createComment(
        announcementId: Types.ObjectId,
        createCommentRequest: CreateCommentRequestDto,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<null>> {
        const savedAnnouncement = await this.announcementsRepository.findAnnouncement({
            _id: announcementId
        });
        if (!savedAnnouncement) {
            throw new NotFoundException('Announcement not found');
        }

        await this.materialsService.authorizeCourseAccess(savedAnnouncement.course.toString(), currentUser);

        await this.commentsRepository.create({
            ...createCommentRequest,
            author: new Types.ObjectId(currentUser._id),
            announcement: announcementId,
            commentedAt: new Date(),
        });

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            data: null,
        };

        return appResponse;
    }

    async getAllComments(announcementId: Types.ObjectId,): Promise<CommentResponseDto[]> {
        const savedAnnouncement = await this.announcementsRepository.findAnnouncement({
            _id: announcementId
        });
        if (!savedAnnouncement) {
            throw new NotFoundException('Announcement not found');
        }

        const comments = await this.commentsRepository.findAll({
            announcement: announcementId,
        });

        return comments.map(this.commentsMapper.toCommentResponse);
    }

    async updateComment(
        commentId: Types.ObjectId,
        updateCommentRequest: UpdateCommentRequestDto,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<CommentResponseDto>> {
        const savedComment = await this.commentsRepository.findComment({
            _id: commentId,
        });
        if (!savedComment) {
            throw new NotFoundException('Comment not found');
        }

        if (savedComment.author.toString() !== currentUser._id) {
            throw new ForbiddenException('You are not authorized to update this comment');
        }

        const updatedComment = await this.commentsRepository.updateComment({
                _id: commentId,
            },
            updateCommentRequest);

        const appResponse: AppResponseDto<CommentResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.commentsMapper.toCommentResponse(updatedComment!),
        };

        return appResponse;
    }

    async deleteComment(
        commentId: Types.ObjectId,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<null>> {
        const savedComment = await this.commentsRepository.findComment({
            _id: commentId,
        });
        if (!savedComment) {
            throw new NotFoundException('Comment not found');
        }

        if (savedComment.author.toString() !== currentUser._id) {
            throw new ForbiddenException('You are not authorized to update this comment');
        }

        await this.commentsRepository.deleteComment({_id: commentId});

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: 'Comment deleted successfully',
            data: null,
        };

        return appResponse;
    }

    async deleteAnnouncementComments(announcementId: Types.ObjectId) {
        return this.commentsRepository.deleteManyComments({announcement: announcementId});
    }

}
