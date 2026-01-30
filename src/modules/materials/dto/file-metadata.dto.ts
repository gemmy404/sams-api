import {IsEnum, IsInt, IsNotEmpty, Max, MaxLength, Min} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {FileContentType} from "../../../common/enums/file-content-type.enum";

export class FileMetadataDto {
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

    @IsNotEmpty({message: 'File size is required'})
    @IsInt({message: 'File size must be an integer'})
    @Min(1, {message: 'File size must be greater than 0'})
    @Max(500 * 1024 * 1024, {message: 'File size must not exceed 500MB'})
    fileSize: number;
}