import {Injectable} from "@nestjs/common";
import {Assignment} from "./schemas/assignments.schema";
import {AssignmentResponseDto} from "./dto/assignment-response.dto";
import {MediaItemsResponseDto} from "../materials/dto/media-items-response.dto";
import {getStaticUrl} from "../../common/utils/get-static-url.util";
import {AssignmentStatus} from "./enums/assignment-status";
import {Course} from "../courses/schemas/courses.schema";
import {Classwork} from "../courses/schemas/classwork.schema";


@Injectable()
export class AssignmentsMapper {

    toAssignmentResponse(this: void, assignment: Assignment, classworkPoints: number = 0): AssignmentResponseDto {
        let assignmentItems: MediaItemsResponseDto[] = [];
        if (assignment.assignmentItems)
            assignmentItems = assignment.assignmentItems.map(item => ({
                originalFileName: item.originalFileName,
                key: item.contentReference,
                displayUrl: getStaticUrl(item.contentReference)!
            }));

        const classworks = (assignment.course as unknown as Course).classwork;
        let classwork: Classwork | undefined = undefined;

        if (classworks)
            classwork = (assignment.course as unknown as Course).classwork
                .find(cw => cw._id!.equals(assignment.classworkId));

        return {
            _id: assignment._id!.toString(),
            title: assignment.title,
            description: assignment.description || null,
            createdAt: assignment.createdAt!.toLocaleString(),
            dueDate: assignment.dueDate.toLocaleString(),
            points: classwork?.points || classworkPoints,
            status: assignment.dueDate.getTime() > Date.now() ? AssignmentStatus.ONGOING : AssignmentStatus.CLOSED,
            enablePlagiarismCheck: assignment.enablePlagiarismCheck,
            plagiarismThreshold: assignment.plagiarismThreshold || null,
            assignmentItems: assignmentItems
        }
    }
}