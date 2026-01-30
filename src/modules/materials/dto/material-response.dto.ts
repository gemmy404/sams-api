import {ApiProperty} from "@nestjs/swagger";
import {MaterialItemsResponseDto} from "./material-items-response.dto";
import {ValidateNested} from "class-validator";

export class MaterialResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty({
        type: [MaterialItemsResponseDto],
    })
    @ValidateNested()
    materialItems: MaterialItemsResponseDto[];
}