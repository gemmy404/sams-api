import {ApiProperty} from "@nestjs/swagger";
import {ArrayMaxSize, IsArray, ValidateNested} from "class-validator";
import {MediaItemsRequestDto} from "../../materials/dto/media-items-request.dto";
import {Type} from "class-transformer";

export class AddAssignSubmissionRequestDto {
    @ApiProperty({type: [MediaItemsRequestDto]})
    @IsArray()
    @ArrayMaxSize(10, {message: 'You cannot upload more than 10 files at once'})
    @ValidateNested()
    @Type(() => MediaItemsRequestDto)
    submittedItems: MediaItemsRequestDto[];
}