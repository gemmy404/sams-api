import {IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class ChangeUserRoleRequestDto {
    @ApiProperty()
    @IsNotEmpty({message: 'Role is required'})
    roleId: string;
}