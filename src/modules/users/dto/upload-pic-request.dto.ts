import {IsNotEmpty} from "class-validator";

export class UploadPicRequestDto {
    @IsNotEmpty({message: 'File name is required'})
    fileName: string;

    @IsNotEmpty({message: 'Content type is required'})
    contentType: string;
}