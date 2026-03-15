import {IsEnum, IsOptional, IsString, Min} from "class-validator";
import {Type} from "class-transformer";
import {ApiProperty} from "@nestjs/swagger";

export class GetEnrollmentsFilterDto {
    @ApiProperty({
        required: false,
        description: 'Search by name, id'
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({
        required: false,
        description: 'Sort by name, academicId, or any classworkId',
        example: '65d7... (classworkId) or "name"',
        default: 'name',
    })
    @IsOptional()
    @IsString()
    sortBy: string = 'name';

    @ApiProperty({
        required: false,
        enum: ['asc', 'desc'],
        default: 'asc',
    })
    @IsOptional()
    @IsEnum(['asc', 'desc'], {message: 'Sort Order must be one of asc, desc'})
    sortOrder: 'asc' | 'desc' = 'asc';

    @ApiProperty({
        required: false,
        default: 1
    })
    @IsOptional()
    @Min(1, {message: 'Page must be greater than 0'})
    @Type(() => Number)
    page: number = 1;

    @ApiProperty({
        required: false,
        default: 10
    })
    @IsOptional()
    @Min(1, {message: 'Size must be greater than 0'})
    @Type(() => Number)
    size: number = 10;
}