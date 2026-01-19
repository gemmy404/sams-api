export class CachedUserDto {
    name: string;
    academicEmail: string;
    academicId: string;
    password: string;
    otp: {
        code: string;
        expiresIn: number;
    };
}