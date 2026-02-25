import {Injectable, NotFoundException} from '@nestjs/common';
import {GradesRepository} from "./grades.repository";
import {Types} from "mongoose";
import {CoursesRepository} from "../courses/courses.repository";
import {EnrollmentsRepository} from "../enrollments/enrollments.repository";
import {CoursesMapper} from "../courses/courses.mapper";
import {GradesMapper} from "./grades.mapper";
import {GetEnrollmentsFilterDto} from "./dto/get-enrollments-filter.dto";
import {GradeResponseDto} from "./dto/grade-response.dto";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {HttpStatusText} from "../../common/enums/http-status-text.enum";
import {constructPagination} from "../../common/utils/pagination.util";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {MaterialsService} from "../materials/materials.service";
import {MyGradeResponseDto} from "./dto/my-grade-response.dto";

@Injectable()
export class GradesService {

    constructor(
        private readonly gradesRepository: GradesRepository,
        private readonly courseRepository: CoursesRepository,
        private readonly enrollmentsRepository: EnrollmentsRepository,
        private readonly gradesMapper: GradesMapper,
        private readonly coursesMapper: CoursesMapper,
        private readonly materialsService: MaterialsService,
    ) {
    }

    async getCourseGradesSheet(
        courseId: Types.ObjectId,
        filterDto: GetEnrollmentsFilterDto,
        locale: string = 'ar'
    ): Promise<AppResponseDto<GradeResponseDto>> {
        const {search, sortBy, sortOrder, page, size} = filterDto;
        const skip = page && size ? (page - 1) * size : undefined;

        const savedCourse = await this.courseRepository.findCourse({
            _id: courseId
        }, {classwork: true});
        const classworks = savedCourse!.classwork;

        const {grades, totalElements} = await this.enrollmentsRepository.findAllGradesWithAggregation(
            courseId,
            sortBy,
            sortOrder,
            size,
            skip,
            locale,
            search
        )

        const appResponse: AppResponseDto<GradeResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: {
                ...this.gradesMapper.toGradeResponse(grades, classworks),
            },
            pagination: constructPagination(totalElements, page, size),
        };

        return appResponse;
    }

    async getStudentGrades(
        courseId: Types.ObjectId,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<MyGradeResponseDto>> {
        const savedCourse = await this.courseRepository.findCourse({
            _id: courseId
        }, {classwork: true});
        if (!savedCourse) {
            throw new NotFoundException('Course not found');
        }

        await this.materialsService.authorizeCourseAccess(courseId.toString(), currentUser);

        const classworks = savedCourse.classwork.filter(cw => cw.isVisible);

        const savedGrades = await this.gradesRepository.findAll({
            course: courseId,
            student: new Types.ObjectId(currentUser._id),
        });

        const appResponse: AppResponseDto<MyGradeResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.gradesMapper.toMyGradeResponse(savedGrades, classworks),
        }

        return appResponse;
    }

}
