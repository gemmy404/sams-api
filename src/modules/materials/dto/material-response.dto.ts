import {ApiProperty} from "@nestjs/swagger";
import {MediaItemsResponseDto} from "./media-items-response.dto";
import {ValidateNested} from "class-validator";

export class MaterialResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty({
        type: [MediaItemsResponseDto],
    })
    @ValidateNested()
    materialItems: MediaItemsResponseDto[];
}