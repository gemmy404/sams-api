import {ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {CreateQuizRequestDto} from "./dto/create-quiz-request.dto";
import {QuizzesMapper} from "./quizzes.mapper";
import {QuizzesRepository} from "./quizzes.repository";
import {QueryFilter, Types} from "mongoose";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {HttpStatusText} from "../../common/enums/http-status-text.enum";
import {QuizResponseDto} from "./dto/quiz-response.dto";
import {MaterialsService} from "../materials/materials.service";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {Quiz} from "./schemas/quizzes.schema";
import {UserRoles} from "../roles/enums/user-roles.enum";

@Injectable()
export class QuizzesService {

    constructor(
        private readonly quizzesRepository: QuizzesRepository,
        private readonly quizzesMapper: QuizzesMapper,
        private readonly materialService: MaterialsService,
    ) {
    }

    async createQuiz(
        courseId: Types.ObjectId,
        createQuizDto: CreateQuizRequestDto
    ): Promise<AppResponseDto<QuizResponseDto>> {
        const {startTime, duration} = createQuizDto;
        const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

        const createdCourse = await this.quizzesRepository
            .createQuiz({course: courseId, endTime, ...createQuizDto});

        const appResponse: AppResponseDto<QuizResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.quizzesMapper.toQuizResponse(createdCourse),
        }

        return appResponse;
    }

    async findAllQuizzes(
        courseId: Types.ObjectId,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<QuizResponseDto[]>> {
        await this.materialService.authorizeCourseAccess(courseId.toString(), currentUser);
        const query: QueryFilter<Quiz> = {course: courseId}
        const roles = currentUser.roles as UserRoles[];

        if (roles.includes(UserRoles.STUDENT)) {
            query.isPublished = true;
            query.startTime = {$lte: new Date()};
        }

        const quizzes = await this.quizzesRepository.findAll(query);
        const appResponse: AppResponseDto<QuizResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: quizzes.map(this.quizzesMapper.toQuizResponse)
        };

        return appResponse;
    }

    async findQuizDetails(
        quizId: Types.ObjectId,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<QuizResponseDto>> {
        const savedQuiz = await this.quizzesRepository.findQuiz({_id: quizId});
        if (!savedQuiz) {
            throw new NotFoundException('Quiz not found');
        }

        await this.materialService.authorizeCourseAccess(savedQuiz.course.toString(), currentUser);
        const roles = currentUser.roles as UserRoles[];

        if (roles.includes(UserRoles.STUDENT)) {
            if (!savedQuiz.isPublished) {
                throw new ForbiddenException('This quiz is not published yet');
            }

            const now = new Date();
            if (now < savedQuiz.startTime) {
                throw new ForbiddenException(`This quiz will be available on ${savedQuiz.startTime.toLocaleString()}`);
            }
        }

        const appResponse: AppResponseDto<QuizResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.quizzesMapper.toQuizResponse(savedQuiz)
        };

        return appResponse;
    }

    async togglePublishedQuiz(
        quizId: Types.ObjectId,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<QuizResponseDto>> {
        const savedQuiz = await this.quizzesRepository.findQuiz({_id: quizId});
        if (!savedQuiz) {
            throw new NotFoundException('Quiz not found');
        }

        await this.materialService.authorizeCourseAccess(savedQuiz.course.toString(), currentUser);

        const updatedQuiz = await this.quizzesRepository.updateQuiz({_id: quizId}, {
            $set: {
                isPublished: !savedQuiz.isPublished
            }
        });

        const appResponse: AppResponseDto<QuizResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.quizzesMapper.toQuizResponse(updatedQuiz!)
        };

        return appResponse;
    }

}
