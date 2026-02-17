import {BadRequestException, Injectable} from '@nestjs/common';
import {CoursesRepository} from "./courses.repository";
import {CreateCourseRequestDto} from "./dto/create-course-request.dto";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {generateCodes} from "../../common/utils/generate-codes.util";
import {Types} from "mongoose";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {HttpStatusText} from "../../common/enums/http-status-text.enum";
import {CourseResponseDto} from "./dto/course-response.dto";
import {CoursesMapper} from "./courses.mapper";
import {Classwork} from "./schemas/classwork.schema";
import {ClassworkResponseDto} from "./dto/classwork-response.dto";

@Injectable()
export class CoursesService {

    constructor(
        private readonly coursesRepository: CoursesRepository,
        private readonly coursesMapper: CoursesMapper,
    ) {
    }

    async createCourse(
        createCourseRequest: CreateCourseRequestDto,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<null>> {
        let totalGrades = createCourseRequest.classwork.reduce((acc, curr) =>
            acc + curr.points, 0);

        totalGrades += createCourseRequest.finalExam;

        if (totalGrades < createCourseRequest.totalGrades) {
            throw new BadRequestException(`Sum of grades must equal total grades: ${createCourseRequest.totalGrades}`);
        }

        const courseInvitationCode: string = generateCodes('alphanumeric');

        await this.coursesRepository.create({
            ...createCourseRequest,
            instructor: new Types.ObjectId(currentUser._id),
            courseInvitationCode,
        });

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: 'Course created successfully',
            data: null,
        };

        return appResponse;
    }

    async findCreatedMyCourse(currentUser: CurrentUserDto): Promise<AppResponseDto<CourseResponseDto[]>> {
        const courses = await this.coursesRepository.findAll({
            instructor: new Types.ObjectId(currentUser._id)
        }, 'createdAt');

        const appResponse: AppResponseDto<CourseResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: courses.map(this.coursesMapper.toCourseResponse)
        };

        return appResponse;
    }

    async getAvailableClassworks(courseId: Types.ObjectId): Promise<AppResponseDto<ClassworkResponseDto[]>> {
        const savedClassworks = await this.coursesRepository.findAllClasswork({
            _id: courseId,
        });

        const classworks: Classwork[] = savedClassworks!.classwork.filter(cw => !cw.isUsed);

        const appResponse: AppResponseDto<ClassworkResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: classworks.map(this.coursesMapper.toClassworkResponse),
        }

        return appResponse;
    }

    async toggleClassworkVisibility(courseId: Types.ObjectId, classworkId: Types.ObjectId) {
        const savedClassworks = await this.coursesRepository.findCourse({
                _id: courseId,
            },
            {classwork: true});

        const requiredClasswork = savedClassworks!.classwork.find(cw =>
            cw._id!.toString() === classworkId.toString()
        );

        await this.coursesRepository.updateCourse(
            {_id: courseId},
            {
                $set: {"classwork.$[elem].isVisible": !requiredClasswork!.isVisible}
            },
            {
                arrayFilters: [{"elem._id": classworkId}],
                new: true,
            }
        );

        requiredClasswork!.isVisible = !requiredClasswork!.isVisible;

        const appResponse: AppResponseDto<ClassworkResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.coursesMapper.toClassworkResponse(requiredClasswork!),
        };

        return appResponse;
    }

}
