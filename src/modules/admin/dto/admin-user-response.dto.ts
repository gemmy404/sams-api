import {UserResponseDto} from "../../users/dto/user-response.dto";
import {UserRoles} from "../../roles/enums/user-roles.enum";
import {ApiProperty} from "@nestjs/swagger";

export class AdminUserResponseDto extends UserResponseDto {
    @ApiProperty()
    isActive: boolean;

    @ApiProperty()
    role: UserRoles;
}