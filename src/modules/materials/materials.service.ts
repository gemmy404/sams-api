import {Injectable, NotFoundException} from '@nestjs/common';
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

}
