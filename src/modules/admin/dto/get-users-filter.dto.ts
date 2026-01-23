import {IsEnum, IsNotEmpty, IsOptional, IsString, Min} from "class-validator";
import {Type} from "class-transformer";

export class GetUsersFilterDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    roleId?: string;

    @IsOptional()
    @IsEnum(['active', 'inactive'], {message: 'Status must be one of active, inactive'})
    status?: string;

    @IsNotEmpty({message: 'Sort by is required'})
    @IsString()
    sortBy: string = 'createdAt';

    @IsOptional()
    @IsEnum(['asc', 'desc'], {message: 'Sort Order must be one of asc, desc'})
    sortOrder: string = 'asc';

    @IsOptional()
    @Min(1, {message: 'Page must be greater than 0'})
    @Type(() => Number)
    page: number = 1;

    @IsOptional()
    @Min(1, {message: 'Size must be greater than 0'})
    @Type(() => Number)
    size: number = 10;
}