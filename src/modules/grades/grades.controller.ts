import {Controller, Get, Param, UseGuards} from '@nestjs/common';
import {GradesService} from './grades.service';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {ParseObjectIdPipe} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {MyGradeResponseDto} from "./dto/my-grade-response.dto";
import {ApiResponse} from "@nestjs/swagger";

@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class GradesController {

    constructor(private readonly gradesService: GradesService) {
    }

    @Get('courses/:courseId/my-grades')
    @ApiResponse({type: MyGradeResponseDto})
    async getMyGrades(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<MyGradeResponseDto>> {
        return this.gradesService.getStudentGrades(courseId, currentUser);
    }

}
