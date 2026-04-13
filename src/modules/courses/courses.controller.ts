import {Body, Controller, Param, Post, UseGuards} from '@nestjs/common';
import {CoursesService} from "./courses.service";
import {ApiResponse} from "@nestjs/swagger";
import {CreateUploadUrlResponseDto} from "../s3/dto/create-upload-url-response.dto";
import {ParseObjectIdPipe} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {UploadMediaItemRequestDto} from "../../common/dto/upload-media-item-request.dto";
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";

@Controller('api/v1/courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {

    constructor(private readonly coursesService: CoursesService) {
    }

    @Post(':courseId/context/presigned-urls')
    @ApiResponse({type: [CreateUploadUrlResponseDto]})
    createUploadUrls(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
        @Body() uploadItemRequest: UploadMediaItemRequestDto,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<CreateUploadUrlResponseDto[]>> {
        return this.coursesService.createUploadUrls(courseId, uploadItemRequest, currentUser);
    }

}
