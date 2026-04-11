import {ApiProperty} from "@nestjs/swagger";
import {ValidateNested} from "class-validator";
import {MediaItemsResponseDto} from "../../materials/dto/media-items-response.dto";
import {AssignmentStatus} from "../enums/assignment-status";

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

    @ApiProperty({enum: AssignmentStatus})
    status: AssignmentStatus;

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