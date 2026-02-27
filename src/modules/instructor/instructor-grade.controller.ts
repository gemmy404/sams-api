import {ApiBearerAuth, ApiResponse} from "@nestjs/swagger";
import {Controller, Get, Headers, Param, Query, Res, UseGuards} from "@nestjs/common";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {RolesGuard} from "../auth/guards/roles.guard";
import {Roles} from "../../common/decorators/roles.decorator";
import {UserRoles} from "../roles/enums/user-roles.enum";
import {IsCourseOwnerGuard} from "../courses/guards/is-course-owner.guard";
import {ParseObjectIdPipe} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {GetEnrollmentsFilterDto} from "../grades/dto/get-enrollments-filter.dto";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {GradeResponseDto} from "../grades/dto/grade-response.dto";
import {GradesService} from "../grades/grades.service";
import type {Response} from "express";
import {GradesCsvService} from "../grades/grades-csv.service";

@ApiBearerAuth('access-token')
@Controller('api/v1/instructor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.INSTRUCTOR)
export class InstructorGradeController {

    constructor(
        private readonly gradesService: GradesService,
        private readonly gradesCsvService: GradesCsvService,
    ) {
    }

    @Get('courses/:courseId/grades')
    @UseGuards(IsCourseOwnerGuard)
    @ApiResponse({type: [GradeResponseDto]})
    findAllGrades(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
        @Query() filterDto: GetEnrollmentsFilterDto,
        @Headers('accept-language') lang: string = 'ar'
    ): Promise<AppResponseDto<GradeResponseDto>> {
        return this.gradesService.getCourseGradesSheet(courseId, filterDto, lang);
    }

    @Get('courses/:courseId/grades/export-grades')
    @UseGuards(IsCourseOwnerGuard)
    exportGrades(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
        @Res() response: Response,
    ): Promise<void> {
        return this.gradesCsvService.generateCsv(courseId, response);
    }
}
