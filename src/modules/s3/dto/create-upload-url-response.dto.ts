import {ApiProperty} from "@nestjs/swagger";

export class CreateUploadUrlResponseDto {
    @ApiProperty()
    key: string;

    @ApiProperty()
    uploadUrl: string;

    @ApiProperty()
    originalFileName: string;
}