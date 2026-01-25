import {Body, Controller, Get, Headers, Param, Patch, Post, Query, UseGuards} from "@nestjs/common";
import {AdminService} from "./admin.service";
import {AdminUserResponseDto} from "./dto/admin-user-response.dto";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {RolesGuard} from "../auth/guards/roles.guard";
import {Roles} from "../../common/decorators/roles.decorator";
import {RoleResponseDto} from "../roles/dto/role-response.dto";
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {ChangeUserRoleRequestDto} from "./dto/change-user-role-request.dto";
import {CreateUserRequestDto} from "./dto/create-user-request.dto";
import {GetUsersFilterDto} from "./dto/get-users-filter.dto";
import {ApiBearerAuth, ApiResponse} from "@nestjs/swagger";

@ApiBearerAuth('access-token')
@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {

    constructor(private readonly adminService: AdminService) {
    }

    @Get('roles')
    @ApiResponse({type: [RoleResponseDto]})
    findAllRoles(): Promise<AppResponseDto<RoleResponseDto[]>> {
        return this.adminService.findAllRoles();
    }

    @Get('users')
    @ApiResponse({type: [AdminUserResponseDto]})
    findAllUsers(
        @Query() filterDto: GetUsersFilterDto,
        @Headers('accept-language') lang: string = 'ar'
    ): Promise<AppResponseDto<AdminUserResponseDto[]>> {
        return this.adminService.findAllUsers(filterDto, lang);
    }

    @Patch('users/:id/toggle-activation')
    @ApiResponse({type: [AdminUserResponseDto]})
    toggleUserActivation(
        @Param('id') id: string,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<AdminUserResponseDto>> {
        return this.adminService.toggleUserActivation(id, currentUser);
    }

    @Patch('users/:id/role')
    @ApiResponse({type: [AdminUserResponseDto]})
    changeUserRole(
        @Param('id') id: string,
        @Body() changeUserRoleRequest: ChangeUserRoleRequestDto,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<AdminUserResponseDto>> {
        return this.adminService.changeUserRole(id, changeUserRoleRequest, currentUser);
    }

    @Post('users')
    createUser(@Body() createUserRequest: CreateUserRequestDto): Promise<AppResponseDto<null>> {
        return this.adminService.createUser(createUserRequest);
    }

}