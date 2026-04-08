import {ApiProperty} from "@nestjs/swagger";
import {
    ArrayMaxSize,
    IsArray, IsDate,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    Max,
    MaxLength,
    Min,
    ValidateNested
} from "class-validator";
import {MediaItemsRequestDto} from "../../materials/dto/media-items-request.dto";
import {Type} from "class-transformer";
import {IsFutureDate} from "../../../common/decorators/is-future-date.decorator";
import {Types} from "mongoose";

export class AddAssignmentRequestDto {
    @ApiProperty()
    @IsNotEmpty({message: 'Title is required'})
    @MaxLength(50, {message: 'Title must not exceed 50 characters'})
    title: string;

    @ApiProperty()
    @IsOptional()
    @MaxLength(2000, {message: 'Description must not exceed 2000 characters'})
    description: string;

    @ApiProperty()
    @IsNotEmpty({message: 'Classwork ID is required'})
    @IsMongoId({message: 'Classwork ID must be a valid mongo id'})
    @Type(() => Types.ObjectId)
    classworkId: Types.ObjectId;

    @ApiProperty()
    @IsNotEmpty({message: 'Due date is required'})
    @Type(() => Date)
    @IsDate({message: 'Due date must be a valid date'})
    @IsFutureDate({message: 'Due date must be a future date'})
    dueDate: Date;

    @ApiProperty()
    @IsOptional()
    enablePlagiarismCheck: boolean;

    @ApiProperty()
    @IsOptional()
    @Min(0, {message: 'Plagiarism threshold must be greater than or equal to 0'})
    @Max(100, {message: 'Plagiarism threshold must be less than or equal to 100'})
    plagiarismThreshold: number;

    @ApiProperty({type: [MediaItemsRequestDto]})
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(10, {message: 'You cannot upload more than 10 files at once'})
    @ValidateNested()
    @Type(() => MediaItemsRequestDto)
    assignmentItems: MediaItemsRequestDto[];
}