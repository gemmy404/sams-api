import {Injectable, NotFoundException} from '@nestjs/common';
import {UsersRepository} from "./users.repository";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {HttpStatusText} from "../../common/enums/http-status-text.enum";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {UserResponseDto} from "./dto/user-response.dto";
import {UsersMapper} from "./users.mapper";
import {UpdateUserRequestDto} from "./dto/update-user-request.dto";
import {UploadPicRequestDto} from "./dto/upload-pic-request.dto";
import {S3Service} from "../s3/s3.service";
import {ConfigService} from "@nestjs/config";
import {CreateUploadUrlResponseDto} from "../s3/dto/create-upload-url-response.dto";
import {SaveProfilePicRequestDto} from "./dto/save-profile-pic-request.dto";

@Injectable()
export class UsersService {

    private readonly baseCloudFrontUrl: string;

    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly usersMapper: UsersMapper,
        private readonly configService: ConfigService,
        private readonly s3Service: S3Service
    ) {
        this.baseCloudFrontUrl = this.configService.getOrThrow<string>('BASE_CLOUDFRONT_URL');
    }

    async getUserProfile(currentUser: CurrentUserDto): Promise<AppResponseDto<UserResponseDto>> {
        const savedUser = await this.usersRepository.findUser({
            _id: currentUser._id
        });
        if (!savedUser) {
            throw new NotFoundException('User not found');
        }

        const appResponse: AppResponseDto<UserResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.usersMapper.toUserResponse(savedUser)
        };

        return appResponse;
    }

    async updateProfile(
        updateUserRequest: UpdateUserRequestDto,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<UserResponseDto>> {
        const updatedUser = await this.usersRepository.updateUser({
                _id: currentUser._id,
            },
            updateUserRequest
        );
        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }

        const appResponse: AppResponseDto<UserResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.usersMapper.toUserResponse(updatedUser),
        };

        return appResponse;
    }

    async createUploadUrl(
        uploadPicRequest: UploadPicRequestDto,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<CreateUploadUrlResponseDto>> {
        const {key, uploadUrl, originalFileName} = await this.s3Service.generateUploadUrl(
            uploadPicRequest.originalFileName,
            uploadPicRequest.contentType,
            'profiles',
            currentUser._id
        );

        const appResponse: AppResponseDto<CreateUploadUrlResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: {
                originalFileName,
                key,
                uploadUrl,
            }
        };

        return appResponse;
    }

    async saveProfilePic(
        saveProfilePicRequest: SaveProfilePicRequestDto,
        currentUser: CurrentUserDto,
    ): Promise<AppResponseDto<UserResponseDto>> {
        const {key} = saveProfilePicRequest;

        const savedUser = await this.usersRepository.findUser({
            _id: currentUser._id
        });
        if (savedUser && savedUser.profilePic) {
            await this.s3Service.deleteFile(savedUser.profilePic);
        }

        const updatedUser = await this.usersRepository.updateUser(
            {
                _id: currentUser._id
            },
            {
                $set: {
                    profilePic: key
                }
            });

        const appResponse: AppResponseDto<UserResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.usersMapper.toUserResponse(updatedUser!)
        };

        return appResponse;
    }
}