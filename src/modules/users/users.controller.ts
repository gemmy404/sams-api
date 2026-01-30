import {Body, Controller, Get, Patch, Post, UseGuards} from '@nestjs/common';
import {UsersService} from './users.service';
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {UpdateUserRequestDto} from "./dto/update-user-request.dto";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {UploadPicRequestDto} from "./dto/upload-pic-request.dto";
import {ApiBearerAuth, ApiResponse} from "@nestjs/swagger";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {UserResponseDto} from "./dto/user-response.dto";
import {CreateUploadUrlResponseDto} from "../s3/dto/create-upload-url-response.dto";
import {SaveProfilePicRequestDto} from "./dto/save-profile-pic-request.dto";

@ApiBearerAuth('access-token')
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
export class UsersController {

    constructor(private readonly usersService: UsersService) {
    }

    @Get('profile')
    @ApiResponse({type: UserResponseDto})
    getUserProfile(@CurrentUser() currentUser: CurrentUserDto): Promise<AppResponseDto<UserResponseDto>> {
        return this.usersService.getUserProfile(currentUser);
    }

    @Patch('profile')
    @ApiResponse({type: UserResponseDto})
    updateProfile(
        @Body() updateUserRequest: UpdateUserRequestDto,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<UserResponseDto>> {
        return this.usersService.updateProfile(updateUserRequest, currentUser);
    }

    @Post('profile-picture/presigned-url')
    @ApiResponse({type: CreateUploadUrlResponseDto})
    createUploadUrl(
        @Body() uploadPicRequest: UploadPicRequestDto,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<CreateUploadUrlResponseDto>> {
        return this.usersService.createUploadUrl(uploadPicRequest, currentUser);
    }

    @Patch('profile-picture')
    @ApiResponse({type: UserResponseDto})
    saveProfilePic(
        @Body() saveProfilePicRequest: SaveProfilePicRequestDto,
        @CurrentUser() currentUser: CurrentUserDto,
    ): Promise<AppResponseDto<UserResponseDto>> {
        return this.usersService.saveProfilePic(saveProfilePicRequest, currentUser);
    }
}
