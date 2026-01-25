import {IsEnum, IsNotEmpty, IsOptional, IsString, Min} from "class-validator";
import {Type} from "class-transformer";
import {ApiProperty} from "@nestjs/swagger";

export class GetUsersFilterDto {
    @ApiProperty({
        required: false,
        description: 'Search by name, email or id'
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({
        required: false,
    })
    @IsOptional()
    @IsString()
    roleId?: string;

    @ApiProperty({
        required: false,
        enum: ['active', 'inactive'],
    })
    @IsOptional()
    @IsEnum(['active', 'inactive'], {message: 'Status must be one of active, inactive'})
    status?: string;

    @ApiProperty({
        required: false,
        enum: ['name', 'academicEmail', 'academicId'],
        default: 'createdAt',
    })
    @IsNotEmpty({message: 'Sort by is required'})
    @IsString()
    sortBy: string = 'createdAt';

    @ApiProperty({
        required: false,
        enum: ['asc', 'desc'],
        default: 'desc',
    })
    @IsOptional()
    @IsEnum(['asc', 'desc'], {message: 'Sort Order must be one of asc, desc'})
    sortOrder: string = 'asc';

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