import {Body, Controller, Param, Post, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {Roles} from "../../common/decorators/roles.decorator";
import {UserRoles} from "../roles/enums/user-roles.enum";
import {RolesGuard} from "../auth/guards/roles.guard";
import {ApiBearerAuth, ApiResponse} from "@nestjs/swagger";
import {IsCourseOwnerGuard} from "../courses/guards/is-course-owner.guard";
import {ParseObjectIdPipe} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {MaterialResponseDto} from "../materials/dto/material-response.dto";
import {AssignmentsService} from "../assignments/assignments.service";
import {AddAssignmentRequestDto} from "../assignments/dto/add-assignment-request.dto";
import {AssignmentResponseDto} from "../assignments/dto/assignment-response.dto";

@ApiBearerAuth('access-token')
@Controller('api/v1/instructor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.INSTRUCTOR)
export class InstructorAssignmentController {

    constructor(private readonly assignmentsService: AssignmentsService) {
    }

    @Post('courses/:courseId/assignments')
    @UseGuards(IsCourseOwnerGuard)
    @ApiResponse({type: MaterialResponseDto})
    createAssignment(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
        @Body() addAssignmentRequest: AddAssignmentRequestDto
    ): Promise<AppResponseDto<AssignmentResponseDto>> {
        return this.assignmentsService.createAssignment(courseId, addAssignmentRequest);
    }


}
