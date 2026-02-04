import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
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
import {QuestionsRepository} from "../questions/questions.repository";
import {UpdateQuizRequestDto} from "./dto/update-quiz-request.dto";
import {QuestionResponseDto} from "../questions/dto/question-response.dto";
import {QuestionsMapper} from "../questions/questions.mapper";

@Injectable()
export class QuizzesService {

    private readonly EARLY_ACCESS_MINUTES = 5;

    constructor(
        private readonly quizzesRepository: QuizzesRepository,
        private readonly questionsRepository: QuestionsRepository,
        private readonly quizzesMapper: QuizzesMapper,
        private readonly questionsMapper: QuestionsMapper,
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
            query.startTime = {$lte: new Date(Date.now() + this.EARLY_ACCESS_MINUTES * 60 * 1000)};
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

            const earliestAllowedEntry = new Date().getTime() + this.EARLY_ACCESS_MINUTES * 60 * 1000;
            if (earliestAllowedEntry < savedQuiz.startTime.getTime()) {
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

    async updateQuiz(
        quizId: Types.ObjectId,
        updateQuizRequestDto: UpdateQuizRequestDto,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<QuizResponseDto>> {
        const savedQuiz = await this.quizzesRepository.findQuiz({_id: quizId});
        if (!savedQuiz) {
            throw new NotFoundException('Quiz not found');
        }

        await this.materialService.authorizeCourseAccess(savedQuiz.course.toString(), currentUser);

        const updatedRequest: any = {...updateQuizRequestDto};

        const currentStartTime = savedQuiz.startTime.getTime();
        const currentEndTime = savedQuiz.endTime.getTime();
        const currentDurationMs = currentEndTime - currentStartTime;

        const newStartTimeDate = updateQuizRequestDto.startTime ?? savedQuiz.startTime;
        const newDurationMinutes = updateQuizRequestDto.duration
            ? (updateQuizRequestDto.duration * 60 * 1000)
            : currentDurationMs;

        if (updateQuizRequestDto.startTime || updateQuizRequestDto.duration) {
            updatedRequest.endTime = new Date(newStartTimeDate.getTime() + newDurationMinutes);

            if (updatedRequest.endTime <= newStartTimeDate) {
                throw new BadRequestException('The calculated end time must be after the start time');
            }
        }

        const updatedQuiz = await this.quizzesRepository
            .updateQuiz({_id: quizId}, updatedRequest);

        const appResponse: AppResponseDto<QuizResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.quizzesMapper.toQuizResponse(updatedQuiz!)
        };

        return appResponse;
    }

    async startQuiz(
        quizId: Types.ObjectId,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<QuestionResponseDto[]>> {
        const savedQuiz = await this.quizzesRepository.findQuiz({_id: quizId});
        if (!savedQuiz) {
            throw new NotFoundException('Quiz not found');
        }

        await this.materialService.authorizeCourseAccess(savedQuiz.course.toString(), currentUser);

        if (!savedQuiz.isPublished) {
            throw new ForbiddenException('This quiz is not published yet');
        }

        const now = new Date();
        if (now.getTime() < savedQuiz.startTime.getTime()) {
            throw new BadRequestException(`This quiz will begin on ${savedQuiz.startTime.toLocaleString()}`);
        }
        if (now.getTime() > savedQuiz.endTime.getTime()) {
            throw new BadRequestException('Quiz has already ended');
        }

        // check if he started quiz or submitted before

        const questions = await this.questionsRepository.findAll({quiz: quizId});
        const userRole: UserRoles = (currentUser.roles as UserRoles[])
            .includes(UserRoles.STUDENT) ? UserRoles.STUDENT : UserRoles.INSTRUCTOR;

        const appResponse: AppResponseDto<QuestionResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: questions.map(question =>
                this.questionsMapper.toQuestionResponse(question, userRole))
        };

        return appResponse;
    }

}
