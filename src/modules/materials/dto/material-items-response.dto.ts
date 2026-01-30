import {ApiProperty} from "@nestjs/swagger";

export class MaterialItemsResponseDto {
    @ApiProperty()
    originalFileName: string;

    @ApiProperty()
    key: string;

    @ApiProperty()
    displayUrl: string;
}