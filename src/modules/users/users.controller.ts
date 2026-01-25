import {Body, Controller, Get, Patch, Put, UseGuards} from '@nestjs/common';
import {UsersService} from './users.service';
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {UpdateUserRequestDto} from "./dto/update-user-request.dto";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {UploadPicRequestDto} from "./dto/upload-pic-request.dto";
import {ApiBearerAuth, ApiResponse} from "@nestjs/swagger";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {UserResponseDto} from "./dto/user-response.dto";
import {UploadPicResponseDto} from "./dto/upload-pic-response.dto";

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

    @Put('profile-picture')
    @ApiResponse({type: UploadPicResponseDto})
    uploadProfilePicture(
        @Body() uploadPicRequest: UploadPicRequestDto,
        @CurrentUser() currentUser: CurrentUserDto
        ): Promise<AppResponseDto<UploadPicResponseDto>> {
        return this.usersService.uploadProfilePicture(uploadPicRequest, currentUser);
    }
}
