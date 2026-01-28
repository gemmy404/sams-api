import {FileMetadataDto} from "./file-metadata.dto";
import {ApiProperty} from "@nestjs/swagger";
import {ArrayMaxSize, IsArray, ValidateNested} from "class-validator";
import {Type} from "class-transformer";

export class UploadMaterialRequestDto {
    @ApiProperty({type: [FileMetadataDto]})
    @IsArray()
    @ArrayMaxSize(10, {message: 'You cannot upload more than 10 files at once'})
    @ValidateNested()
    @Type(() => FileMetadataDto)
    filesMetadata: FileMetadataDto[];
}