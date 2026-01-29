import {Body, Controller, Param, Post, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {Roles} from "../../common/decorators/roles.decorator";
import {UserRoles} from "../roles/enums/user-roles.enum";
import {RolesGuard} from "../auth/guards/roles.guard";
import {ApiBearerAuth} from "@nestjs/swagger";
import {UploadMaterialRequestDto} from "../materials/dto/upload-material-request.dto";
import {CreateUploadUrlResponseDto} from "../s3/dto/create-upload-url-response.dto";
import {MaterialsService} from "../materials/materials.service";
import {IsCourseOwnerGuard} from "../courses/guards/is-course-owner.guard";
import {ParseObjectIdPipe} from "@nestjs/mongoose";
import {AddMaterialRequestDto} from "../materials/dto/add-material-request.dto";
import {Types} from "mongoose";
import {MaterialResponseDto} from "../materials/dto/material-response.dto";

@ApiBearerAuth('access-token')
@Controller('api/v1/instructor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.INSTRUCTOR)
export class InstructorMaterialController {

    constructor(private readonly materialsService: MaterialsService) {
    }

    @Post('courses/:courseId/materials/presigned-urls')
    @UseGuards(IsCourseOwnerGuard)
    createUploadUrls(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
        @Body() uploadMaterialRequest: UploadMaterialRequestDto
    ): Promise<AppResponseDto<CreateUploadUrlResponseDto[]>> {
        return this.materialsService.createUploadUrls(courseId, uploadMaterialRequest);
    }

    @Post('courses/:courseId/materials')
    @UseGuards(IsCourseOwnerGuard)
    addMaterials(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
        @Body() addMaterialRequest: AddMaterialRequestDto
    ): Promise<AppResponseDto<MaterialResponseDto>> {
        return this.materialsService.addMaterials(courseId, addMaterialRequest);
    }

}
