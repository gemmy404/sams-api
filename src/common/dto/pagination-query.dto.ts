import {ApiProperty} from "@nestjs/swagger";
import {IsInt, IsOptional, Min} from "class-validator";
import {Type} from "class-transformer";

export class PaginationQueryDto {
    @ApiProperty({
        required: false,
        default: 1
    })
    @IsOptional()
    @IsInt({message: 'Page must be an integer'})
    @Min(1, {message: 'Page must be greater than 0'})
    @Type(() => Number)
    page: number = 1;

    @ApiProperty({
        required: false,
        default: 10
    })
    @IsOptional()
    @IsInt({message: 'Size must be an integer'})
    @Min(1, {message: 'Size must be greater than 0'})
    @Type(() => Number)
    size: number = 10;
}