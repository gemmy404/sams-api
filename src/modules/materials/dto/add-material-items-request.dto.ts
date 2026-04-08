import {ArrayMaxSize, IsArray, ValidateNested} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {MediaItemsRequestDto} from "./media-items-request.dto";
import {Type} from "class-transformer";

export class AddMaterialItemsRequestDto {
    @ApiProperty({type: [MediaItemsRequestDto]})
    @IsArray()
    @ArrayMaxSize(10, {message: 'You cannot upload more than 10 files at once'})
    @ValidateNested()
    @Type(() => MediaItemsRequestDto)
    materialItems: MediaItemsRequestDto[];
}