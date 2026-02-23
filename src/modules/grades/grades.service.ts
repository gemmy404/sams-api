import {Injectable} from '@nestjs/common';
import {GradesRepository} from "./grades.repository";
import {Types} from "mongoose";
import {CoursesRepository} from "../courses/courses.repository";
import {EnrollmentsRepository} from "../enrollments/enrollments.repository";
import {CoursesMapper} from "../courses/courses.mapper";
import {GradesMapper} from "./grades.mapper";
import {GetEnrollmentsFilterDto} from "./dto/get-enrollments-filter.dto";
import {ClassworkResponseDto} from "../courses/dto/classwork-response.dto";
import {GradeResponseDto} from "./dto/grade-response.dto";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {HttpStatusText} from "../../common/enums/http-status-text.enum";
import {constructPagination} from "../../common/utils/pagination.util";

@Injectable()
export class GradesService {

    constructor(
        private readonly gradesRepository: GradesRepository,
        private readonly courseRepository: CoursesRepository,
        private readonly enrollmentsRepository: EnrollmentsRepository,
        private readonly gradesMapper: GradesMapper,
        private readonly coursesMapper: CoursesMapper,
    ) {
    }

    async getCourseGradesSheet(
        courseId: Types.ObjectId,
        filterDto: GetEnrollmentsFilterDto,
        locale: string = 'ar'
    ): Promise<AppResponseDto<GradeResponseDto>> {
        const {search, sortBy, sortOrder, page, size} = filterDto;
        const skip = (page - 1) * size;

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

        const columns: ClassworkResponseDto[] = classworks.map(this.coursesMapper.toClassworkResponse);

        const appResponse: AppResponseDto<GradeResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: {
                ...this.gradesMapper.toGradeResponse(grades, columns),
            },
            pagination: constructPagination(totalElements, page, size),
        };

        return appResponse;
    }

}
