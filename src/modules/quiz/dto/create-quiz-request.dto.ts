import {IsDate, IsInt, IsNotEmpty, IsOptional, Min, MinDate} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {Type} from "class-transformer";

export class CreateQuizRequestDto {
    @ApiProperty()
    @IsNotEmpty({message: 'Title is required'})
    title: string;

    @ApiProperty()
    @IsOptional()
    description: string;

    @ApiProperty()
    @IsNotEmpty({message: 'Start time is required'})
    @Type(() => Date)
    @IsDate({message: 'Start time must be a date'})
    @MinDate(new Date(), {message: 'Start time cannot be in the past'})
    startTime: Date;

    @ApiProperty()
    @IsNotEmpty({message: 'Duration is required'})
    @IsInt({message: 'Duration must be a integer number'})
    @Min(1, {message: 'Duration must be greater than 0'})
    duration: number; // in min
}