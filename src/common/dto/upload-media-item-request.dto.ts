import {FileMetadataDto} from "./file-metadata.dto";
import {ApiProperty} from "@nestjs/swagger";
import {ArrayMaxSize, IsArray, IsEnum, IsNotEmpty, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {MediaItemType} from "../enums/media-item-type.enum";

export class UploadMediaItemRequestDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsEnum(MediaItemType, {message: `Type must be one of ${Object.values(MediaItemType).join(', ')}`})
    context: MediaItemType;

    @ApiProperty({type: [FileMetadataDto]})
    @IsArray()
    @ArrayMaxSize(10, {message: 'You cannot upload more than 10 files at once'})
    @ValidateNested()
    @Type(() => FileMetadataDto)
    filesMetadata: FileMetadataDto[];
}