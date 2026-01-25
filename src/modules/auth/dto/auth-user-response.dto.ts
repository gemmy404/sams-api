import {ApiProperty} from "@nestjs/swagger";

export class AuthUserResponseDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    academicEmail: string;

    @ApiProperty({ nullable: true })
    profilePic: string | null;
}
