import {Body, Controller, Get, Patch, Put, UseGuards} from '@nestjs/common';
import {UsersService} from './users.service';
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {UpdateUserRequestDto} from "./dto/update-user-request.dto";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {UploadPicRequestDto} from "./dto/upload-pic-request.dto";

@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
export class UsersController {

    constructor(private readonly usersService: UsersService) {
    }

    @Get('profile')
    getUserProfile(@CurrentUser() currentUser: CurrentUserDto) {
        return this.usersService.getUserProfile(currentUser);
    }

    @Patch('profile')
    updateProfile(
        @Body() updateUserRequest: UpdateUserRequestDto,
        @CurrentUser() currentUser: CurrentUserDto
    ) {
        return this.usersService.updateProfile(updateUserRequest, currentUser);
    }

    @Put('profile-picture')
    uploadProfilePicture(
        @Body() uploadPicRequest: UploadPicRequestDto,
        @CurrentUser() currentUser: CurrentUserDto
        ) {
        return this.usersService.uploadProfilePicture(uploadPicRequest, currentUser);
    }
}
