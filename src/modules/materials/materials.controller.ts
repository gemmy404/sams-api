import {Controller, Get, Param, UseGuards} from '@nestjs/common';
import {MaterialsService} from './materials.service';
import {Types} from "mongoose";
import {ParseObjectIdPipe} from "@nestjs/mongoose";
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {MaterialResponseDto} from "./dto/material-response.dto";
import {ApiResponse} from "@nestjs/swagger";

@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class MaterialsController {
    constructor(private readonly materialsService: MaterialsService) {
    }

    @Get('courses/:courseId/materials')
    @ApiResponse({type: [MaterialResponseDto]})
    findAllMaterials(
        @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<MaterialResponseDto[]>> {
        return this.materialsService.findAllMaterials(courseId, currentUser)
    }

    @Get('materials/:materialId')
    @ApiResponse({type: MaterialResponseDto})
    findMaterialDetails(
        @Param('materialId', ParseObjectIdPipe) materialId: Types.ObjectId,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<MaterialResponseDto>> {
        return this.materialsService.findMaterialDetails(materialId, currentUser);
    }
}
