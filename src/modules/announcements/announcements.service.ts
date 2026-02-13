import {Injectable, NotFoundException} from '@nestjs/common';
import {AnnouncementsRepository} from "./announcements.repository";
import {Types} from "mongoose";
import {CreateAnnouncementRequestDto} from "./dto/create-announcement-request.dto";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {HttpStatusText} from "../../common/enums/http-status-text.enum";
import {AnnouncementResponseDto} from "./dto/announcement-response.dto";
import {AnnouncementsMapper} from "./announcements.mapper";
import {MaterialsService} from "../materials/materials.service";
import {UpdateAnnouncementRequestDto} from "./dto/update-announcement-request.dto";
import {CommentsService} from "../comments/comments.service";
import {CommentResponseDto} from "../comments/dto/comment-response.dto";

@Injectable()
export class AnnouncementsService {

    constructor(
        private readonly announcementsRepository: AnnouncementsRepository,
        private readonly commentsService: CommentsService,
        private readonly announcementsMapper: AnnouncementsMapper,
        private readonly materialsService: MaterialsService,
    ) {
    }

    async createAnnouncement(
        courseId: Types.ObjectId,
        createAnnouncementRequest: CreateAnnouncementRequestDto,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<null>> {
        await this.announcementsRepository.create({
            ...createAnnouncementRequest,
            course: courseId,
            instructor: new Types.ObjectId(currentUser._id),
        });

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: 'Announcement created successfully',
            data: null,
        }

        return appResponse;
    }

    async getAllAnnouncements(
        courseId: Types.ObjectId,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<AnnouncementResponseDto[]>> {
        await this.materialsService.authorizeCourseAccess(courseId.toString(), currentUser);

        const announcements = await this.announcementsRepository.findAll({
            course: courseId,
        });

        const appResponse: AppResponseDto<AnnouncementResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: announcements.map(this.announcementsMapper.toAnnouncementResponse),
        };

        return appResponse;
    }

    async getAnnouncementDetails(
        announcementId: Types.ObjectId,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<AnnouncementResponseDto>> {
        const savedAnnouncement = await this.announcementsRepository.findAnnouncement({
            _id: announcementId
        });
        if (!savedAnnouncement) {
            throw new NotFoundException('Announcement not found');
        }

        await this.materialsService.authorizeCourseAccess(savedAnnouncement.course.toString(), currentUser);

        const comments: CommentResponseDto[] = await this.commentsService.getAllComments(announcementId);

        const appResponse: AppResponseDto<AnnouncementResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: {
                ...this.announcementsMapper.toAnnouncementResponse(savedAnnouncement),
                comments,
            },
        };

        return appResponse;
    }

    async updateAnnouncement(
        announcementId: Types.ObjectId,
        updateAnnouncementRequest: UpdateAnnouncementRequestDto,
        currentUser: CurrentUserDto,
    ): Promise<AppResponseDto<AnnouncementResponseDto>> {
        const savedAnnouncement = await this.announcementsRepository.findAnnouncement({
            _id: announcementId
        });
        if (!savedAnnouncement) {
            throw new NotFoundException('Announcement not found');
        }

        await this.materialsService.authorizeCourseAccess(savedAnnouncement.course.toString(), currentUser);

        const updatedAnnouncement = await this.announcementsRepository.updateAnnouncement({
                _id: announcementId,
            },
            updateAnnouncementRequest,
        );

        const appResponse: AppResponseDto<AnnouncementResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.announcementsMapper.toAnnouncementResponse(updatedAnnouncement!),
        };

        return appResponse;
    }

    async deleteAnnouncement(
        announcementId: Types.ObjectId,
        currentUser: CurrentUserDto,
    ): Promise<AppResponseDto<null>> {
        const savedAnnouncement = await this.announcementsRepository.findAnnouncement({
            _id: announcementId
        });
        if (!savedAnnouncement) {
            throw new NotFoundException('Announcement not found');
        }

        await this.materialsService.authorizeCourseAccess(savedAnnouncement.course.toString(), currentUser);

        await this.announcementsRepository.deleteAnnouncement({_id: announcementId});

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: 'Announcement deleted successfully',
            data: null,
        };

        return appResponse;
    }

}