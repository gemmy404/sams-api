import {Injectable} from "@nestjs/common";
import {Assignment} from "./schemas/assignments.schema";
import {AssignmentResponseDto} from "./dto/assignment-response.dto";
import {MediaItemsResponseDto} from "../materials/dto/media-items-response.dto";
import {getStaticUrl} from "../../common/utils/get-static-url.util";
import {AssignmentStatus} from "./enums/assignment-status";


@Injectable()
export class AssignmentsMapper {

    toAssignmentResponse(this: void, assignment: Assignment): AssignmentResponseDto {
        let assignmentItems: MediaItemsResponseDto[] = [];
        if (assignment.assignmentItems)
            assignmentItems = assignment.assignmentItems.map(item => ({
                originalFileName: item.originalFileName,
                key: item.contentReference,
                displayUrl: getStaticUrl(item.contentReference)!
            }));
        return {
            _id: assignment._id!.toString(),
            title: assignment.title,
            description: assignment.description || null,
            createdAt: assignment.createdAt!.toLocaleString(),
            dueDate: assignment.dueDate.toLocaleString(),
            status: assignment.dueDate.getTime() > Date.now() ? AssignmentStatus.AVAILABLE : AssignmentStatus.CLOSED,
            enablePlagiarismCheck: assignment.enablePlagiarismCheck,
            plagiarismThreshold: assignment.plagiarismThreshold || null,
            assignmentItems: assignmentItems
        }
    }
}