import {UserResponseDto} from "../../users/dto/user-response.dto";
import {UserRoles} from "../../roles/enums/user-roles.enum";

export class AdminUserResponseDto extends UserResponseDto {
    isActive: boolean;
    role: UserRoles;
}