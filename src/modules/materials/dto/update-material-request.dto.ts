import {IsOptional, MaxLength} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class UpdateMaterialRequestDto {
    @ApiProperty()
    @IsOptional()
    @MaxLength(50, {message: 'Title must not exceed 50 characters'})
    title: string;

    @ApiProperty()
    @IsOptional()
    @MaxLength(100, {message: 'Description must not exceed 100 characters'})
    description: string;
}