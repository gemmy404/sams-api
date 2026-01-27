import {IsEnum, IsInt, IsNotEmpty, Max, Min} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {ProfilePicContentType} from "../../../common/enums/profile-pic-content-type.enum";

export class UploadPicRequestDto {
    @ApiProperty()
    @IsNotEmpty({message: 'Original file name is required'})
    originalFileName: string;

    @ApiProperty({
        enum: ProfilePicContentType,
    })
    @IsNotEmpty({message: 'Content type is required'})
    @IsEnum(ProfilePicContentType)
    contentType: ProfilePicContentType;

    @IsNotEmpty({message: 'File size is required'})
    @IsInt({message: 'File size must be an integer'})
    @Min(1, {message: 'File size must be greater than 0'})
    @Max(5 * 1024 * 1024, {message: 'File size must not exceed 5MB'})
    fileSize: number;
}