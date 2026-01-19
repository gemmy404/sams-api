export class LoginResponseDto {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: {
        name: string;
        academicEmail: string;
        profilePic: string | null;
    }
}