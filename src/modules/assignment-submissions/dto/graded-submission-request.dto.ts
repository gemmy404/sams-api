import {SubmissionActionStatus} from "../enums/submission-action-status.enum";
import {IsEnum, IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class GradedSubmissionRequestDto {
    @ApiProperty({enum: SubmissionActionStatus})
    @IsNotEmpty({message: 'Action is required'})
    @IsEnum(SubmissionActionStatus, {message: `Action must be one of ${Object.values(SubmissionActionStatus).join(', ')}`})
    action: SubmissionActionStatus;
}
