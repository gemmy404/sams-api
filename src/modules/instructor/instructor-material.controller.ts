import {Body, Controller, Delete, Param, Patch, Post, Query, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {Roles} from "../../common/decorators/roles.decorator";
import {UserRoles} from "../roles/enums/user-roles.enum";
import {RolesGuard} from "../auth/guards/roles.guard";
import {ApiBearerAuth, ApiResponse} from "@nestjs/swagger";
import {UploadMaterialRequestDto} from "../materials/dto/upload-material-request.dto";
import {CreateUploadUrlResponseDto} from "../s3/dto/create-upload-url-response.dto";
import {MaterialsService} from "../materials/materials.service";
import {IsCourseOwnerGuard} from "../courses/guards/is-course-owner.guard";
import {ParseObjectIdPipe} from "@nestjs/mongoose";
import {AddMaterialRequestDto} from "../materials/dto/add-material-request.dto";
import {Types} from "mongoose";
import {MaterialResponseDto} from "../materials/dto/material-response.dto";
import {IsMaterialOwnerGuard} from "../materials/guards/is-material-owner.guard";
import {UpdateMaterialRequestDto} from "../materials/dto/update-material-request.dto";
import {AddMaterialItemsRequestDto} from "../materials/dto/add-material-items-request.dto";

@ApiBearerAuth('access-token')
@Controller('api/v1/instructor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.INSTRUCTOR)
export class InstructorMaterialController {

    constructor(private readonly materialsService: MaterialsService) {
    }

    @Post('courses/:courseId/materials/presigned-urls')
    @UseGuards(IsCourseOwnerGuard)
    @ApiResponse({type: [CreateUploadUrlResponseDto]})
    createUploadUrls(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
        @Body() uploadMaterialRequest: UploadMaterialRequestDto
    ): Promise<AppResponseDto<CreateUploadUrlResponseDto[]>> {
        return this.materialsService.createUploadUrls(courseId, uploadMaterialRequest);
    }

    @Post('courses/:courseId/materials')
    @UseGuards(IsCourseOwnerGuard)
    @ApiResponse({type: MaterialResponseDto})
    addMaterials(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
        @Body() addMaterialRequest: AddMaterialRequestDto
    ): Promise<AppResponseDto<MaterialResponseDto>> {
        return this.materialsService.addMaterials(courseId, addMaterialRequest);
    }

    @Patch('materials/:materialId')
    @UseGuards(IsMaterialOwnerGuard)
    @ApiResponse({type: MaterialResponseDto})
    updateMaterial(
        @Param('materialId', ParseObjectIdPipe) materialId: Types.ObjectId,
        @Body() updateMaterialRequest: UpdateMaterialRequestDto
    ): Promise<AppResponseDto<MaterialResponseDto>> {
        return this.materialsService.updateMaterial(materialId, updateMaterialRequest);
    }

    @Delete('materials/:materialId')
    @UseGuards(IsMaterialOwnerGuard)
    deleteMaterial(
        @Param('materialId', ParseObjectIdPipe) materialId: Types.ObjectId
    ): Promise<AppResponseDto<null>> {
        return this.materialsService.deleteMaterial(materialId);
    }

    @Post('materials/:materialId/items')
    @UseGuards(IsMaterialOwnerGuard)
    @ApiResponse({type: MaterialResponseDto})
    addMaterialItems(
        @Param('materialId', ParseObjectIdPipe) materialId: Types.ObjectId,
        @Body() addMaterialItemsRequest: AddMaterialItemsRequestDto
    ): Promise<AppResponseDto<MaterialResponseDto>> {
        return this.materialsService.addMaterialItems(materialId, addMaterialItemsRequest);
    }

    @Delete('materials/:materialId/items')
    @UseGuards(IsMaterialOwnerGuard)
    @ApiResponse({type: MaterialResponseDto})
    deleteMaterialItem(
        @Param('materialId', ParseObjectIdPipe) materialId: Types.ObjectId,
        @Query('itemKey') itemKey: string,
    ): Promise<AppResponseDto<MaterialResponseDto>> {
        return this.materialsService.deleteMaterialItem(materialId, itemKey);
    }

}
