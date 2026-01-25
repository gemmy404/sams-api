import {IsNotEmpty, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class RefreshTokenRequestDto {
    @ApiProperty()
    @IsNotEmpty({message: 'Refresh token is required'})
    @IsString({message: 'Refresh token must be a string'})
    refreshToken: string;
}