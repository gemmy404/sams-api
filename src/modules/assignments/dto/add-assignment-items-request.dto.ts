import {ArrayMaxSize, IsArray, ValidateNested} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {Type} from "class-transformer";
import {MediaItemsRequestDto} from "../../materials/dto/media-items-request.dto";

export class AddAssignmentItemsRequestDto {
    @ApiProperty({type: [MediaItemsRequestDto]})
    @IsArray()
    @ArrayMaxSize(10, {message: 'You cannot upload more than 10 files at once'})
    @ValidateNested()
    @Type(() => MediaItemsRequestDto)
    assignmentItems: MediaItemsRequestDto[];
}