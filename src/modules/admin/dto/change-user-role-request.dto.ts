import {IsNotEmpty} from "class-validator";

export class ChangeUserRoleRequestDto {
    @IsNotEmpty({message: 'Role is required'})
    roleId: string;
}