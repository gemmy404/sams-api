import {UserResponseDto} from "../../users/dto/user-response.dto";
import {ApiProperty} from "@nestjs/swagger";
import {MediaItemsResponseDto} from "../../materials/dto/media-items-response.dto";

export class SubmissionResponseDto {
    @ApiProperty()
    studentInfo: Partial<UserResponseDto>;

    @ApiProperty()
    _id: string;

    @ApiProperty()
    submittedAt: string;

    @ApiProperty({
        type: [MediaItemsResponseDto],
        default: []
    })
    submittedItems: MediaItemsResponseDto[];

    @ApiProperty({description: 'Whether the assignment needs review'})
    neededReview: boolean;

    @ApiProperty({description: 'Total points of the assignment'})
    points: number;

    @ApiProperty({description: 'Points earned by the user'})
    earnedPoints: number;
}
