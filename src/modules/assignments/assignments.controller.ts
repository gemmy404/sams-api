import {Controller, Get, Param, UseGuards} from '@nestjs/common';
import {AssignmentsService} from './assignments.service';
import {Types} from "mongoose";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {AssignmentResponseDto} from "./dto/assignment-response.dto";
import {ParseObjectIdPipe} from "@nestjs/mongoose";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {ApiBearerAuth, ApiResponse} from "@nestjs/swagger";

@ApiBearerAuth('access-token')
@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class AssignmentsController {
    constructor(private readonly assignmentsService: AssignmentsService) {
    }

    @Get('courses/:courseId/assignments')
    @ApiResponse({type: [AssignmentResponseDto]})
    getAllAssignments(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<AssignmentResponseDto[]>> {
        return this.assignmentsService.findAllAssignments(courseId, currentUser);
    }

    @Get('assignments/:assignmentId')
    @ApiResponse({type: AssignmentResponseDto})
    getAssignmentDetails(
        @Param('assignmentId', ParseObjectIdPipe) assignmentId: Types.ObjectId,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<AssignmentResponseDto>> {
        return this.assignmentsService.findAssignmentDetails(assignmentId, currentUser);
    }

}
