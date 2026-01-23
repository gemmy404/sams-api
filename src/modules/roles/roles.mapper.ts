import {Roles} from "./schemas/roles.schema";
import {RoleResponseDto} from "./dto/role-response.dto";

export class RolesMapper {

    toRoleResponse(this: void, role: Roles): RoleResponseDto {
        return {
            _id: role._id.toString(),
            name: role.name,
        }
    }
}