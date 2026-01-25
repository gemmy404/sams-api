import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import {UsersMapper} from "../users/users.mapper";
import {UsersRepository} from "../users/users.repository";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {AdminUserResponseDto} from "./dto/admin-user-response.dto";
import {HttpStatusText} from "../../common/enums/http-status-text.enum";
import {constructPagination} from "../../common/utils/pagination.util";
import {Roles} from "../roles/schemas/roles.schema";
import {RolesRepository} from "../roles/roles.repository";
import {RoleResponseDto} from "../roles/dto/role-response.dto";
import {RolesMapper} from "../roles/roles.mapper";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {Users} from "../users/schemas/users.schema";
import {ChangeUserRoleRequestDto} from "./dto/change-user-role-request.dto";
import {CreateUserRequestDto} from "./dto/create-user-request.dto";
import {hash} from "bcryptjs";
import {GetUsersFilterDto} from "./dto/get-users-filter.dto";
import {Types} from "mongoose";

@Injectable()
export class AdminService {

    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly rolesRepository: RolesRepository,
        private readonly usersMapper: UsersMapper,
        private readonly rolesMapper: RolesMapper,
    ) {
    }

    async findAllRoles(): Promise<AppResponseDto<RoleResponseDto[]>> {
        const roles = await this.rolesRepository.findAll();

        const appResponse: AppResponseDto<RoleResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: roles.map(this.rolesMapper.toRoleResponse),
        };

        return appResponse;
    }

    async findAllUsers(filterDto: GetUsersFilterDto, locale: string): Promise<AppResponseDto<AdminUserResponseDto[]>> {
        const {search, roleId, status, page, size} = filterDto;
        const query: any = {};

        if (search) {
            query.$or = [
                {name: {$regex: search, $options: "i"}},
                {academicEmail: {$regex: search, $options: "i"}},
                {academicId: {$regex: search, $options: "i"}},
            ];
        }

        const sortBy = ['name', 'academicEmail', 'academicId', 'createdAt'].includes(filterDto.sortBy)
            ? filterDto.sortBy
            : 'createdAt';
        let sortOrder: string = filterDto.sortOrder;
        if (sortBy === 'createdAt') {
            sortOrder = 'desc';
        }

        if (roleId) {
            query.roles = new Types.ObjectId(roleId);
        }
        if (status) {
            query.isActive = status === 'active';
        }

        const skip: number = (page - 1) * size;
        const {users, totalElements} = await this.usersRepository
            .findAll(query, sortBy, sortOrder, locale, size, skip);

        const appResponse: AppResponseDto<AdminUserResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: users.map(user => {
                const role = user.roles[0] as unknown as Roles;
                return {
                    ...this.usersMapper.toUserResponse(user),
                    isActive: user.isActive,
                    role: role.name,
                } as AdminUserResponseDto;
            }),
            pagination: constructPagination(totalElements, page, size),
        };

        return appResponse;
    }

    async toggleUserActivation(id: string, currentUser: CurrentUserDto): Promise<AppResponseDto<AdminUserResponseDto>> {
        const savedUser = await this.usersRepository.findUserWithRoles({_id: id});
        if (!savedUser) {
            throw new NotFoundException(`User with id: ${id} not found`);
        }

        if (id === currentUser._id) {
            throw new ForbiddenException('You cannot deactivate your own account');
        }

        const updatedUser = await this.usersRepository
            .updateUser({_id: id}, {isActive: !savedUser.isActive});
        const role = savedUser.roles[0] as unknown as Roles;

        const appResponse: AppResponseDto<AdminUserResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: {
                ...this.usersMapper.toUserResponse(updatedUser as Users),
                isActive: updatedUser!.isActive!,
                role: role.name,
            },
        };

        return appResponse;
    }

    async changeUserRole(
        userId: string,
        changeUserRoleRequest: ChangeUserRoleRequestDto,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<AdminUserResponseDto>> {
        if (userId === currentUser._id) {
            throw new ForbiddenException('You cannot change role for your account');
        }

        const role = await this.rolesRepository.findRole({
            _id: changeUserRoleRequest.roleId
        });
        if (!role) {
            throw new NotFoundException('User role not found');
        }

        const updatedUser = await this.usersRepository.updateUser({
                _id: userId,
            },
            {
                $set: {
                    roles: [role._id]
                }
            }
        );
        if (!updatedUser) {
            throw new NotFoundException(`User with id: ${userId} not found`);
        }

        const appResponse: AppResponseDto<AdminUserResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: {
                ...this.usersMapper.toUserResponse(updatedUser),
                isActive: updatedUser.isActive!,
                role: role.name,
            },
        };

        return appResponse;
    }

    async createUser(createUserRequest: CreateUserRequestDto): Promise<AppResponseDto<null>> {
        if (createUserRequest.academicId !== createUserRequest.academicEmail.split('@')[0]) {
            throw new BadRequestException('Academic ID must be identical to the prefix of your academic email');
        }

        const user = await this.usersRepository.findUser({
            $or: [
                {academicEmail: createUserRequest.academicEmail},
                {academicId: createUserRequest.academicId},
            ]
        });
        if (user) {
            throw new ConflictException('It looks like you\'re already registered.' +
                ' The email or Academic ID you entered is already in use');
        }

        const hashedPassword: string = await hash(createUserRequest.password, 10);

        const createdUser = await this.usersRepository
            .createUser(this.usersMapper.toUserSchema({...createUserRequest, password: hashedPassword}));

        console.log("createdUser by admin:", createdUser);

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: 'Account created successfully',
            data: null,
        }

        return appResponse;
    }
}