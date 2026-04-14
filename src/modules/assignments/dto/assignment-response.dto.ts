import {ApiProperty} from "@nestjs/swagger";
import {ValidateNested} from "class-validator";
import {MediaItemsResponseDto} from "../../materials/dto/media-items-response.dto";
import {AssignmentStatus} from "../enums/assignment-status";
import {AssignmentSubmissionStatus} from "../../assignment-submissions/enums/assignment-submission.status.enum";

export class AssignmentResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    title: string;

    @ApiProperty({nullable: true})
    description: string | null;

    @ApiProperty()
    createdAt: string;

    @ApiProperty()
    dueDate: string;

    @ApiProperty()
    points: number;

    @ApiProperty({enum: AssignmentStatus || AssignmentSubmissionStatus})
    status: AssignmentStatus | AssignmentSubmissionStatus;

    @ApiProperty()
    classworkId: string;

    @ApiProperty({default: false})
    enablePlagiarismCheck: boolean;

    @ApiProperty({nullable: true})
    plagiarismThreshold: number | null;

    @ApiProperty({
        type: [MediaItemsResponseDto],
        default: []
    })
    @ValidateNested()
    assignmentItems: MediaItemsResponseDto[];
}