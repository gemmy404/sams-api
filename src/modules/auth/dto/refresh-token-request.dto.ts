import {IsNotEmpty, IsString} from "class-validator";

export class RefreshTokenRequestDto {
    @IsNotEmpty({message: 'Refresh token is required'})
    @IsString({message: 'Refresh token must be a string'})
    refreshToken: string;
}