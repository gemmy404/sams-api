import {IsEnum, IsNotEmpty, MaxLength} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {FileContentType} from "../../../common/enums/file-content-type.enum";

export class MaterialItemsRequestDto {
    @ApiProperty()
    @IsNotEmpty({message: 'Original file name is required'})
    @MaxLength(50, {message: 'File name must not exceed 50 characters'})
    originalFileName: string;

    @ApiProperty({
        enum: FileContentType,
    })
    @IsNotEmpty({message: 'Content type is required'})
    @IsEnum(FileContentType, {message: `Content type must be one of ${Object.keys(FileContentType).join(', ')}`})
    contentType: FileContentType;

    @ApiProperty()
    @IsNotEmpty({message: 'Content reference file name is required'})
    @MaxLength(100, {message: 'Content reference must not exceed 100 characters'})
    contentReference: string;
}