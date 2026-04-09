import {CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException} from "@nestjs/common";
import {AssignmentsRepository} from "../assignments.repository";
import {CurrentUserDto} from "../../../common/dto/current-user.dto";
import {Course} from "../../courses/schemas/courses.schema";
import {Request} from "express";
import {Types} from "mongoose";

@Injectable()
export class IsAssignmentOwnerGuard implements CanActivate {

    constructor(private readonly assignmentsRepository: AssignmentsRepository) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();

        const user: CurrentUserDto = request.user as CurrentUserDto;
        const assignmentId: string = request.params.assignmentId as string;

        if (!assignmentId) {
            throw new ForbiddenException('Assignment ID is required for this action');
        }

        const savedAssignment = await this.assignmentsRepository.findAssignmentOwner({
            _id: new Types.ObjectId(assignmentId),
        });
        if (!savedAssignment) {
            throw new NotFoundException('Assignment not found');
        }

        const course = savedAssignment.course as unknown as Course;
        const isOwner: boolean = course.instructor._id.toString() === user._id.toString();
        if (!isOwner) {
            throw new ForbiddenException('You are not authorized to manage this course');
        }

        return true;
    }
}