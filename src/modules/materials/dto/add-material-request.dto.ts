import {ArrayMaxSize, IsArray, IsNotEmpty, IsOptional, MaxLength, ValidateNested} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {MaterialItemsRequestDto} from "./material-items-request.dto";
import {Type} from "class-transformer";

export class AddMaterialRequestDto {
    @ApiProperty()
    @IsNotEmpty({message: 'Title is required'})
    @MaxLength(50, {message: 'Title must not exceed 50 characters'})
    title: string;

    @ApiProperty()
    @IsOptional()
    @MaxLength(100, {message: 'Description must not exceed 100 characters'})
    description: string;

    @ApiProperty({type: [MaterialItemsRequestDto]})
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(10, {message: 'You cannot upload more than 10 files at once'})
    @ValidateNested()
    @Type(() => MaterialItemsRequestDto)
    materialItems: MaterialItemsRequestDto[];
}