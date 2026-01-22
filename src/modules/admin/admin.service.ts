import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {UsersMapper} from "../users/users.mapper";
import {UsersRepository} from "../users/users.repository";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {AdminUserResponseDto} from "./dto/admin-user-response.dto";
import {UserRoles} from "../roles/enums/user-roles.enum";
import {HttpStatusText} from "../../common/enums/http-status-text.enum";
import {constructPagination} from "../../common/utils/pagination.util";
import {Roles} from "../roles/schemas/roles.schema";

@Injectable()
export class AdminService {

    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly usersMapper: UsersMapper,
    ) {
    }

    async findAllUsersOrByRole(size: number, page: number, role?: UserRoles): Promise<AppResponseDto<AdminUserResponseDto[]>> {
        if (role && !Object.values(UserRoles).includes(role)) {
            throw new NotFoundException('User role not found');
        }

        if (size < 1 || page < 1) {
            throw new BadRequestException('Size and page must be greater than 0');
        }

        const skip = (page - 1) * size;
        const {users, totalElements} = await this.usersRepository
            .findUserByRole(size, skip, role);

        const appResponse: AppResponseDto<AdminUserResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: users.map(user => ({
                ...this.usersMapper.toUserResponse(user),
                isActive: user.isActive,
                role: role,
            } as AdminUserResponseDto)),
            pagination: constructPagination(totalElements, page, size),
        };

        return appResponse;
    }

    async findUserByEmail(email: string): Promise<AppResponseDto<AdminUserResponseDto>> {
        if (!email) {
            throw new BadRequestException('Email is required');
        }

        const savedUser = await this.usersRepository.findUserWithRoles({
            academicEmail: email
        });
        if (!savedUser) {
            throw new NotFoundException(`User with email ${email} not found`);
        }

        const role = savedUser.roles[0] as unknown as Roles;

        const appResponse: AppResponseDto<AdminUserResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: {
                ...this.usersMapper.toUserResponse(savedUser),
                isActive: savedUser.isActive!,
                role: role.name,
            }
        }

        return appResponse;
    }

}