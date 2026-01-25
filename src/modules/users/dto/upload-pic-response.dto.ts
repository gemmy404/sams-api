import {ApiProperty} from "@nestjs/swagger";

export class UploadPicResponseDto {
    @ApiProperty()
    key: string;

    @ApiProperty()
    uploadUrl: string;

    @ApiProperty()
    displayUrl: string;
}