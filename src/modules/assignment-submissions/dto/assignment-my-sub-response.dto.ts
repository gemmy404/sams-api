import {AssignmentResponseDto} from "../../assignments/dto/assignment-response.dto";
import {ApiProperty} from "@nestjs/swagger";
import {MediaItemsResponseDto} from "../../materials/dto/media-items-response.dto";
import {ValidateNested} from "class-validator";

export class AssignmentMySubResponseDto extends AssignmentResponseDto {
    @ApiProperty()
    submissionId: string | null;

    @ApiProperty({
        type: [MediaItemsResponseDto],
        default: []
    })
    @ValidateNested()
    submittedItems: MediaItemsResponseDto[];
}