import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {CoursesRepository} from "./courses.repository";
import {CreateCourseRequestDto} from "./dto/create-course-request.dto";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {generateCodes} from "../../common/utils/generate-codes.util";
import {Types} from "mongoose";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {HttpStatusText} from "../../common/enums/http-status-text.enum";
import {CourseResponseDto} from "./dto/course-response.dto";
import {CoursesMapper} from "./courses.mapper";
import {Classwork} from "./schemas/classwork.schema";
import {ClassworkResponseDto} from "./dto/classwork-response.dto";
import {EnrollmentsRepository} from "../enrollments/enrollments.repository";
import {UpdateCourseRequestDto} from "./dto/update-course-request.dto";
import {CourseDetailsResponseDto} from "./dto/course-details-response.dto";
import {CourseClassworkDto} from "./dto/course-classwork.dto";
import {UploadMediaItemRequestDto} from "../../common/dto/upload-media-item-request.dto";
import {CreateUploadUrlResponseDto} from "../s3/dto/create-upload-url-response.dto";
import {FileMetadataDto} from "../../common/dto/file-metadata.dto";
import {S3Service} from "../s3/s3.service";
import {MediaItemType} from "../../common/enums/media-item-type.enum";

@Injectable()
export class CoursesService {

    constructor(
        private readonly coursesRepository: CoursesRepository,
        private readonly enrollmentsRepository: EnrollmentsRepository,
        private readonly coursesMapper: CoursesMapper,
        private readonly s3Service: S3Service,
    ) {
    }

    async createCourse(
        createCourseRequest: CreateCourseRequestDto,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<null>> {
        let totalGrades = createCourseRequest.classwork.reduce((acc, curr) =>
            acc + curr.points, 0);

        totalGrades += createCourseRequest.finalExam;

        if (totalGrades < createCourseRequest.totalGrades) {
            throw new BadRequestException(`Sum of grades must equal total grades: ${createCourseRequest.totalGrades}`);
        }

        const courseInvitationCode: string = generateCodes('alphanumeric');

        await this.coursesRepository.create({
            ...createCourseRequest,
            instructor: new Types.ObjectId(currentUser._id),
            courseInvitationCode,
        });

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: 'Course created successfully',
            data: null,
        };

        return appResponse;
    }

    async createUploadUrls(
        courseId: Types.ObjectId,
        uploadMediaRequest: UploadMediaItemRequestDto,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<CreateUploadUrlResponseDto[]>> {
        const filesMetadata = uploadMediaRequest.filesMetadata;
        const context = uploadMediaRequest.context;

        const savedCourse = await this.coursesRepository.findCourse({
            _id: courseId,
        });
        if (!savedCourse) {
            throw new NotFoundException('Course not found');
        }

        if (context !== MediaItemType.MATERIAL && !uploadMediaRequest.classworkId) {
            throw new BadRequestException('Classwork ID is required for this context');
        }

        const isClassworkExists = savedCourse.classwork
            .some(cw => cw._id!.toString() === uploadMediaRequest.classworkId);
        if (uploadMediaRequest.classworkId && !isClassworkExists) {
            throw new NotFoundException('Classwork not found');
        }

        const cId: string = courseId.toString();
        const cwId: string = uploadMediaRequest.classworkId;
        const userId: string = currentUser._id;
        let folderName: string = `courses/${cId}/${context}`;
        const fileNamePrefix: string = Date.now().toString();

        if (context === MediaItemType.ASSIGNMENT) {
            folderName += `/${cwId}`;
        } else if (context === MediaItemType.ASSIGNMENT_SUBMISSION) {
            folderName = `courses/${cId}/assignments/${cwId}/submissions/${userId}`;
        }

        const res = await Promise.all(filesMetadata.map(async (file: FileMetadataDto) =>
            await this.s3Service.generateUploadUrl(
                file.originalFileName,
                file.contentType,
                folderName,
                fileNamePrefix,
            )
        ));

        const appResponse: AppResponseDto<CreateUploadUrlResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: res
        };

        return appResponse;
    }

    async findCreatedMyCourse(currentUser: CurrentUserDto): Promise<AppResponseDto<CourseResponseDto[]>> {
        const courses = await this.coursesRepository.findAll({
            instructor: new Types.ObjectId(currentUser._id)
        }, 'createdAt');

        const appResponse: AppResponseDto<CourseResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: courses.map(this.coursesMapper.toCourseResponse)
        };

        return appResponse;
    }

    async findCourseDetails(courseId: Types.ObjectId): Promise<AppResponseDto<CourseDetailsResponseDto>> {
        const savedCourse = await this.coursesRepository.findCourse({_id: courseId});
        if (!savedCourse) {
            throw new NotFoundException('Course not found');
        }

        const appResponse: AppResponseDto<CourseDetailsResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: {
                ...this.coursesMapper.toCourseResponse(savedCourse),
                classwork: savedCourse.classwork.map(this.coursesMapper.toClassworkResponse),
            },
        };

        return appResponse;
    }

    async updateCourse(
        courseId: Types.ObjectId,
        updateCourseRequestDto: UpdateCourseRequestDto
    ): Promise<AppResponseDto<CourseDetailsResponseDto>> {
        const savedCourse = await this.coursesRepository.findCourse({
            _id: courseId
        });

        const classwork = updateCourseRequestDto.classwork;
        if (classwork && classwork.length > 0) {
            if (classwork.length !== savedCourse!.classwork.length) {
                throw new BadRequestException('Classwork length must be the same as the original one');
            }

            const existingIdsSet = new Set(savedCourse!.classwork.map(cw => cw._id!.toString()));

            const allIdsValid: boolean = classwork.every(cw => existingIdsSet.has(cw._id));
            if (!allIdsValid) {
                throw new BadRequestException('Invalid Classwork IDs provided');
            }

            let totalGrades: number = classwork.reduce((acc, curr) =>
                acc + curr.points, 0);

            totalGrades += updateCourseRequestDto.finalExam || savedCourse!.finalExam;
            const totalCourseGrades: number = (updateCourseRequestDto.totalGrades || savedCourse!.totalGrades);

            if (totalGrades !== totalCourseGrades) {
                throw new BadRequestException(`Sum of grades must equal total grades: ${totalCourseGrades}`);
            }
        }

        const updatedCourse = await this.coursesRepository.updateCourse({
                _id: courseId
            },
            {$set: updateCourseRequestDto});

        const appResponse: AppResponseDto<CourseDetailsResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: {
                ...this.coursesMapper.toCourseResponse(updatedCourse!),
                classwork: updatedCourse!.classwork.map(this.coursesMapper.toClassworkResponse),
            },
        };

        return appResponse;
    }

    async deleteCourse(courseId: Types.ObjectId): Promise<AppResponseDto<null>> {
        await Promise.all([
            this.enrollmentsRepository.deleteMany({course: courseId.toString()}),
            this.coursesRepository.deleteCourse({_id: courseId}),
        ]);

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: 'Course deleted successfully',
            data: null,
        };

        return appResponse;
    }

    async addClasswork(
        courseId: Types.ObjectId,
        createClassworkRequest: CourseClassworkDto
    ): Promise<AppResponseDto<null>> {
        const savedCourse = await this.coursesRepository.findCourse({
            _id: courseId
        });

        const isDuplicate: boolean = savedCourse!.classwork.some(cw =>
            cw.name === createClassworkRequest.name
        );
        if (isDuplicate) {
            throw new BadRequestException(
                `Classwork with name (${createClassworkRequest.name}) already exists`
            );
        }

        await this.coursesRepository.updateCourse(
            {_id: courseId},
            {
                $push: {"classwork": createClassworkRequest},
                $inc: {"totalGrades": createClassworkRequest.points}
            }
        );

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: 'Classwork added successfully',
            data: null,
        };

        return appResponse;
    }

    async getAvailableClassworks(courseId: Types.ObjectId): Promise<AppResponseDto<ClassworkResponseDto[]>> {
        const savedClassworks = await this.coursesRepository.findAllClasswork({
            _id: courseId,
        });

        const classworks: Classwork[] = savedClassworks!.classwork.filter(cw => !cw.isUsed);

        const appResponse: AppResponseDto<ClassworkResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: classworks.map(this.coursesMapper.toClassworkResponse),
        }

        return appResponse;
    }

    async toggleClassworkVisibility(
        courseId: Types.ObjectId,
        classworkId: Types.ObjectId
    ): Promise<AppResponseDto<ClassworkResponseDto>> {
        const savedClassworks = await this.coursesRepository.findCourse({
                _id: courseId,
            },
            {classwork: true});

        const requiredClasswork = savedClassworks!.classwork.find(cw =>
            cw._id!.toString() === classworkId.toString()
        );

        if (!requiredClasswork) {
            throw new NotFoundException('Classwork not found');
        }

        await this.coursesRepository.updateCourse(
            {_id: courseId},
            {
                $set: {"classwork.$[elem].isVisible": !requiredClasswork.isVisible}
            },
            {
                arrayFilters: [{"elem._id": classworkId}],
                new: true,
            }
        );

        requiredClasswork.isVisible = !requiredClasswork.isVisible;

        const appResponse: AppResponseDto<ClassworkResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.coursesMapper.toClassworkResponse(requiredClasswork),
        };

        return appResponse;
    }

    async deleteClasswork(
        courseId: Types.ObjectId,
        classworkId: Types.ObjectId
    ): Promise<AppResponseDto<null>> {
        const savedClassworks = await this.coursesRepository.findCourse({
                _id: courseId,
            },
            {classwork: true});

        const requiredClasswork = savedClassworks!.classwork.find(cw =>
            cw._id!.toString() === classworkId.toString()
        );

        if (!requiredClasswork) {
            throw new NotFoundException('Classwork not found');
        }

        if (requiredClasswork.isUsed) {
            throw new BadRequestException('Cannot delete classwork:' +
                ' Students already have grades assigned to it');
        }

        await this.coursesRepository.updateCourse(
            {_id: courseId},
            {
                $pull: {"classwork": {_id: classworkId}},
                $inc: {"totalGrades": -requiredClasswork.points}
            }
        );

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: 'Classwork deleted successfully',
            data: null,
        };

        return appResponse;
    }

}
