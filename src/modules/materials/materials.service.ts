import {ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {MaterialsRepository} from "./materials.repository";
import {UploadMaterialRequestDto} from "./dto/upload-material-request.dto";
import {CoursesRepository} from "../courses/courses.repository";
import {S3Service} from "../s3/s3.service";
import {FileMetadataDto} from "./dto/file-metadata.dto";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {CreateUploadUrlResponseDto} from "../s3/dto/create-upload-url-response.dto";
import {HttpStatusText} from "../../common/enums/http-status-text.enum";
import {AddMaterialRequestDto} from "./dto/add-material-request.dto";
import {Types} from "mongoose";
import {MaterialResponseDto} from "./dto/material-response.dto";
import {MaterialsMapper} from "./materials.mapper";
import {EnrollmentsRepository} from "../enrollments/enrollments.repository";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {MaterialItem} from "./schemas/material-items.schema";
import {UpdateMaterialRequestDto} from "./dto/update-material-request.dto";
import {MaterialItemsRequestDto} from "./dto/material-items-request.dto";

@Injectable()
export class MaterialsService {

    constructor(
        private readonly materialsRepository: MaterialsRepository,
        private readonly coursesRepository: CoursesRepository,
        private readonly enrollmentsRepository: EnrollmentsRepository,
        private readonly s3Service: S3Service,
        private readonly materialsMapper: MaterialsMapper,
    ) {
    }

    async createUploadUrls(
        courseId: Types.ObjectId,
        uploadMaterialRequest: UploadMaterialRequestDto
    ): Promise<AppResponseDto<CreateUploadUrlResponseDto[]>> {
        const filesMetadata = uploadMaterialRequest.filesMetadata;

        const savedCourse = await this.coursesRepository.findCourse({
            _id: courseId,
        });
        if (!savedCourse) {
            throw new NotFoundException('Course not found');
        }

        const res = await Promise.all(filesMetadata.map(async (file: FileMetadataDto) =>
            await this.s3Service.generateUploadUrl(
                file.originalFileName,
                file.contentType,
                `materials/${courseId.toString()}`,
                `${Date.now()}`,
            )
        ));

        const appResponse: AppResponseDto<CreateUploadUrlResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: res
        };

        return appResponse;
    }

    async addMaterials(
        courseId: Types.ObjectId,
        addMaterialRequest: AddMaterialRequestDto
    ): Promise<AppResponseDto<MaterialResponseDto>> {
        const {title, description, materialItems} = addMaterialRequest;

        const createdMaterial = await this.materialsRepository.createMaterial({
            title,
            description,
            course: courseId,
            materialItems,
        });

        const appResponse: AppResponseDto<MaterialResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.materialsMapper.toMaterialResponse(createdMaterial),
        };

        return appResponse;
    }

    async deleteMaterial(materialId: Types.ObjectId): Promise<AppResponseDto<null>> {
        const deletedMaterial = await this.materialsRepository
            .deleteAndReturn(materialId);

        const keys: { Key: string }[] = deletedMaterial!.materialItems.map(item => (
            {Key: item.contentReference}
        ));
        if (keys.length > 0)
            await this.s3Service.deleteMultipleFiles(keys);

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: `Material deleted successfully`,
            data: null,
        };

        return appResponse;
    }

    async deleteMaterialItem(materialId: Types.ObjectId, itemKey: string): Promise<AppResponseDto<null>> {
        const savedMaterial = await this.materialsRepository.findOne({
            _id: materialId
        });

        const itemToDelete: MaterialItem | undefined = savedMaterial!.materialItems.find(
            (item: MaterialItem) => item.contentReference === itemKey);
        if (!itemToDelete) {
            throw new NotFoundException('File not found in this material');
        }

        await this.materialsRepository.deleteItemFromMaterial(materialId, itemKey);
        await this.s3Service.deleteFile(itemKey);

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: `File deleted successfully`,
            data: null,
        };

        return appResponse;
    }

    async findAllMaterials(
        courseId: Types.ObjectId,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<MaterialResponseDto[]>> {
        await this.authorizeCourseAccess(courseId.toString(), currentUser);

        const materials = await this.materialsRepository
            .findAll({course: courseId}, {materialItems: false});

        const appResponse: AppResponseDto<MaterialResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: materials.map(this.materialsMapper.toMaterialResponse)
        };

        return appResponse;
    }

    async findMaterialDetails(
        materialId: Types.ObjectId,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<MaterialResponseDto>> {
        const savedMaterial = await this.materialsRepository.findOne({
            _id: materialId,
        });
        if (!savedMaterial) {
            throw new NotFoundException('The requested material could not be found');
        }

        await this.authorizeCourseAccess(savedMaterial.course.toString(), currentUser);

        const appResponse: AppResponseDto<MaterialResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.materialsMapper.toMaterialResponse(savedMaterial)
        };

        return appResponse;
    }

    private async authorizeCourseAccess(courseId: string, currentUser: CurrentUserDto): Promise<void> {
        const savedCourse = await this.coursesRepository.findCourse({
            _id: courseId,
        });
        if (!savedCourse) {
            throw new NotFoundException('Course not found');
        }

        const roles = currentUser.roles as string[];
        if (roles.includes('instructor')) {
            if (savedCourse.instructor.toString() !== currentUser._id) {
                throw new ForbiddenException('You can only manage materials for' +
                    ' courses you have created');
            }
        } else {
            const savedEnrollment = await this.enrollmentsRepository
                .findByUserIdAndCourseId(currentUser._id, courseId);

            if (!savedEnrollment) {
                throw new ForbiddenException('You must be enrolled in' +
                    ' this course to view its materials');
            }
        }
    }
}
