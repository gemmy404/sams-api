import {IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class UploadPicRequestDto {
    @ApiProperty()
    @IsNotEmpty({message: 'File name is required'})
    fileName: string;

    @ApiProperty({
        example: 'image/png'
    })
    @IsNotEmpty({message: 'Content type is required'})
    contentType: string;
}