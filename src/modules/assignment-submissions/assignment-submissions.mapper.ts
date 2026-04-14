import {Injectable} from "@nestjs/common";
import {AssignmentSubmission} from "./schemas/assignment-submissions.schema";
import {Users} from "../users/schemas/users.schema";
import {SubmissionResponseDto} from "./dto/submission-response.dto";
import {MediaItemsResponseDto} from "../materials/dto/media-items-response.dto";
import {getStaticUrl} from "../../common/utils/get-static-url.util";

@Injectable()
export class AssignmentSubmissionsMapper {

    toSubmissionResponse(
        this: void,
        submission: AssignmentSubmission,
        classworkPoints: number = 0
    ): SubmissionResponseDto {
        let submittedItems: MediaItemsResponseDto[] = [];
        if (submission.submittedItems)
            submittedItems = submission.submittedItems.map(item => ({
                originalFileName: item.originalFileName,
                key: item.contentReference,
                displayUrl: getStaticUrl(item.contentReference)!
            }));
        const student = submission.student as unknown as Users;
        let profilePic: string | null = null;
        if (student.profilePic) {
            profilePic = getStaticUrl(student.profilePic);
        }

        return {
            studentInfo: {
                academicId: student.academicId,
                name: student.name,
                profilePic: profilePic,
            },
            _id: submission._id!.toString(),
            submittedAt: submission.submittedAt.toLocaleString(),
            submittedItems: submittedItems,
            neededReview: submission.neededReview,
            points: classworkPoints,
            earnedPoints: submission.hasFullMark ? classworkPoints : 0,
        }
    }
}