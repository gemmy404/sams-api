import {ApiProperty} from "@nestjs/swagger";
import {IsDate, IsNotEmpty} from "class-validator";
import {IsFutureDate} from "../../../common/decorators/is-future-date.decorator";
import {Type} from "class-transformer";

export class CreateMeetingRequestDto {
    @ApiProperty()
    @IsNotEmpty({message: 'Start time is required'})
    @Type(() => Date)
    @IsDate({message: 'Start time must be a valid date'})
    @IsFutureDate({message: 'Start time must be in the future'})
    startTime: Date;
}