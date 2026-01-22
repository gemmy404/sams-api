import {Controller, DefaultValuePipe, Get, ParseIntPipe, Query, UseGuards} from "@nestjs/common";
import {AdminService} from "./admin.service";
import {AdminUserResponseDto} from "./dto/admin-user-response.dto";
import {UserRoles} from "../roles/enums/user-roles.enum";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {RolesGuard} from "../auth/guards/roles.guard";
import {Roles} from "../../common/decorators/roles.decorator";

@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {

    constructor(private readonly adminService: AdminService) {
    }

    @Get('users')
    findAllUsersOrByRole(
        @Query('size', new DefaultValuePipe(4), ParseIntPipe) size: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('role') role?: UserRoles,
    ): Promise<AppResponseDto<AdminUserResponseDto[] | AdminUserResponseDto>> {
        return this.adminService.findAllUsersOrByRole(size, page, role);
    }

    @Get('users/search')
    findUserByEmail(@Query('email') email: string): Promise<AppResponseDto<AdminUserResponseDto>> {
        return this.adminService.findUserByEmail(email);
    }

}