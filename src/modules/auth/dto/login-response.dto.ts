import {ApiProperty} from "@nestjs/swagger";
import {AuthUserResponseDto} from "./auth-user-response.dto";

export class LoginResponseDto {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken: string;

    @ApiProperty()
    expiresIn: number;

    @ApiProperty({type: AuthUserResponseDto})
    user: AuthUserResponseDto
}