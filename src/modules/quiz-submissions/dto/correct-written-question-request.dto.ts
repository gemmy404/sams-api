import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, Min} from "class-validator";
import {Type} from "class-transformer";

export class CorrectWrittenQuestionRequestDto {
    @ApiProperty()
    @IsNotEmpty({message: 'Earned points are required'})
    @Min(0, {message: 'Earned points must be greater than or equal to 0'})
    @Type(() => Number)
    earnedPoints: number;
}
