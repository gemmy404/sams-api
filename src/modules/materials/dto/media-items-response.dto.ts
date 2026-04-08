import {ApiProperty} from "@nestjs/swagger";

export class MediaItemsResponseDto {
    @ApiProperty()
    originalFileName: string;

    @ApiProperty()
    key: string;

    @ApiProperty()
    displayUrl: string;
}