import {Body, Controller, Delete, Param, Post, Query, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {Roles} from "../../common/decorators/roles.decorator";
import {UserRoles} from "../roles/enums/user-roles.enum";
import {RolesGuard} from "../auth/guards/roles.guard";
import {ApiBearerAuth, ApiResponse} from "@nestjs/swagger";
import {IsCourseOwnerGuard} from "../courses/guards/is-course-owner.guard";
import {ParseObjectIdPipe} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {AssignmentsService} from "../assignments/assignments.service";
import {AddAssignmentRequestDto} from "../assignments/dto/add-assignment-request.dto";
import {AssignmentResponseDto} from "../assignments/dto/assignment-response.dto";
import {IsAssignmentOwnerGuard} from "../assignments/guards/is-assignment-owner.guard";
import {AddAssignmentItemsRequestDto} from "../assignments/dto/add-assignment-items-request.dto";

@ApiBearerAuth('access-token')
@Controller('api/v1/instructor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.INSTRUCTOR)
export class InstructorAssignmentController {

    constructor(private readonly assignmentsService: AssignmentsService) {
    }

    @Post('courses/:courseId/assignments')
    @UseGuards(IsCourseOwnerGuard)
    @ApiResponse({type: AssignmentResponseDto})
    createAssignment(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
        @Body() addAssignmentRequest: AddAssignmentRequestDto
    ): Promise<AppResponseDto<AssignmentResponseDto>> {
        return this.assignmentsService.createAssignment(courseId, addAssignmentRequest);
    }

    @Delete('assignments/:assignmentId')
    @UseGuards(IsAssignmentOwnerGuard)
    deleteAssignment(
        @Param('assignmentId', ParseObjectIdPipe) assignmentId: Types.ObjectId
    ): Promise<AppResponseDto<null>> {
        return this.assignmentsService.deleteAssignment(assignmentId);
    }

    @Post('assignments/:assignmentId/items')
    @UseGuards(IsAssignmentOwnerGuard)
    @ApiResponse({type: AssignmentResponseDto})
    addAssignmentItems(
        @Param('assignmentId', ParseObjectIdPipe) assignmentId: Types.ObjectId,
        @Body() addAssignmentItemsRequest: AddAssignmentItemsRequestDto
    ): Promise<AppResponseDto<AssignmentResponseDto>> {
        return this.assignmentsService.addAssignmentItems(assignmentId, addAssignmentItemsRequest);
    }

    @Delete('assignments/:assignmentId/items')
    @UseGuards(IsAssignmentOwnerGuard)
    @ApiResponse({type: AssignmentResponseDto})
    deleteAssignmentItem(
        @Param('assignmentId', ParseObjectIdPipe) assignmentId: Types.ObjectId,
        @Query('itemKey') itemKey: string,
    ): Promise<AppResponseDto<AssignmentResponseDto>> {
        return this.assignmentsService.deleteAssignmentItems(assignmentId, itemKey);
    }

}
