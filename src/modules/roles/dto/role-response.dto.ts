import {ApiProperty} from "@nestjs/swagger";

export class RoleResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    name: string;
}