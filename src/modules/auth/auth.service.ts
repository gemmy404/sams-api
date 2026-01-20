import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {LoginRequestDto} from "./dto/login-request.dto";
import {UsersRepository} from "../users/users.repository";
import {compare, hash} from "bcryptjs";
import {JWT_CONFIG} from "../../common/constants/jwt.constant";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {JwtService} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {LoginResponseDto} from "./dto/login-response.dto";
import {HttpStatusText} from "../../common/enums/http-status-text.enum";
import {AuthMapper} from "./auth.mapper";
import {RegisterRequestDto} from "./dto/register-request.dto";
import {CacheService} from "../cache/cache.service";
import {VerifyCodeRequestDto} from "./dto/verify-code-request.dto";
import {CachedUserDto} from "./dto/cached-user.dto";
import {RolesRepository} from "../roles/roles.repository";
import {Roles} from "../roles/schemas/roles.schema";
import {InjectModel} from "@nestjs/mongoose";
import {VerificationCode} from "./schemas/verification-codes.schema";
import {Model} from "mongoose";
import {generateOtp} from "../../common/utils/otp.util";
import {SendMailDto} from "../mail/dto/send-mail.dto";
import {VerificationType} from "./enums/verification-type.enum";
import {InjectQueue} from "@nestjs/bullmq";
import {Queue} from "bullmq";
import {ForgotPasswordRequestDto} from "./dto/forgot-password-request.dto";
import {ResetPasswordRequestDto} from "./dto/reset-password-request.dto";
import {MAIL_CONTENT} from "../../common/constants/mail-message.constant";
import {ResendCodeRequestDto} from "./dto/resend-code-request.dto";
import {RefreshTokenRequestDto} from "./dto/refresh-token-request.dto";

@Injectable()
export class AuthService {

    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly rolesRepository: RolesRepository,
        private readonly authMapper: AuthMapper,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly cacheService: CacheService,
        @InjectModel(VerificationCode.name) private readonly verificationCodeModel: Model<VerificationCode>,
        @InjectQueue('mail') private readonly mailQueue: Queue,
    ) {
    }

    async register(registerDto: RegisterRequestDto) {
        const user = await this.usersRepository.findUser({
            academicEmail: registerDto.academicEmail
        });
        if (user) {
            throw new BadRequestException('Email already exists');
        }

        if (registerDto.password !== registerDto.confirmPassword) {
            throw new BadRequestException('Passwords do not match');
        }

        const otp: string = generateOtp();

        const mailDetails: SendMailDto = {
            to: registerDto.academicEmail,
            name: registerDto.name,
            subject: MAIL_CONTENT.ACTIVATION.SUBJECT,
            message: MAIL_CONTENT.ACTIVATION.MESSAGE,
            otp: otp,
            timeInMin: 5,
        };
        await this.mailQueue.add('sendOtpEmail', mailDetails, {
            attempts: 3,
            backoff: 3000,
            removeOnComplete: true,
        });

        const tempUser: CachedUserDto = {
            name: registerDto.name,
            academicEmail: registerDto.academicEmail,
            academicId: registerDto.academicId,
            password: await hash(registerDto.password, 10),
            otp: {
                code: otp,
                expiresIn: Date.now() + 300000
            },
        };

        await this.cacheService.createItem(`register:${registerDto.academicEmail}`, tempUser, 300000);

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: 'Registration successful! Please check your email to activate your account',
            data: null
        };

        return appResponse;
    }

    async verifyOtp(verifyCodeRequest: VerifyCodeRequestDto) {
        const role = await this.rolesRepository.findRoleByNameOrCreate('student');

        if (verifyCodeRequest.action === VerificationType.ACTIVATE_ACCOUNT) {
            return await this.verifyRegistration(verifyCodeRequest, role);
        } else if (verifyCodeRequest.action === VerificationType.RESET_PASSWORD) {
            return await this.verifyResetPasswordCode(verifyCodeRequest);
        }
    }

    async login(loginRequest: LoginRequestDto): Promise<AppResponseDto<LoginResponseDto>> {
        const savedUser = await this.usersRepository.findUserWithRoles({
            academicEmail: loginRequest.academicEmail
        });
        if (!savedUser || !(await compare(loginRequest.password, savedUser.password))) {
            throw new UnauthorizedException('Email or password is incorrect');
        }

        if (!savedUser.isActive) {
            throw new BadRequestException('Account is inactive, please contact support');
        }

        const payload: CurrentUserDto = {
            _id: savedUser._id.toString(),
            academicEmail: savedUser.academicEmail,
            roles: savedUser.roles,
        };
        const tokens = await this.issueTokens(payload);

        const appResponse: AppResponseDto<LoginResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.authMapper.toLoginResponse(tokens, savedUser),
        };

        return appResponse;
    }

    async logout(currentUserDto: CurrentUserDto) {
        const savedUser = await this.usersRepository.findUser({_id: currentUserDto._id});
        if (!savedUser) {
            throw new UnauthorizedException('User does not exist');
        }

        await this.usersRepository.updateUser({_id: currentUserDto._id}, {
            $set: {
                refreshToken: null
            }
        });

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: 'Logged out successfully',
            data: null
        }

        return appResponse;
    }

    async forgotPassword(forgotPasswordRequest: ForgotPasswordRequestDto) {
        const savedUser = await this.usersRepository.findUser({
            academicEmail: forgotPasswordRequest.academicEmail
        });
        if (!savedUser) {
            throw new UnauthorizedException('The email that you\'ve entered is incorrect');
        }

        const resetCode = generateOtp();
        const expiresAt = new Date();
        expiresAt.setTime(expiresAt.getTime() + 300000);

        const mailDetails: SendMailDto = {
            to: savedUser.academicEmail,
            name: savedUser.name,
            subject: MAIL_CONTENT.RESET_PASSWORD.SUBJECT,
            message: MAIL_CONTENT.RESET_PASSWORD.MESSAGE,
            otp: resetCode,
            timeInMin: 5,
        };
        await this.mailQueue.add('sendOtpEmail', mailDetails, {
            attempts: 3,
            backoff: 3000,
            removeOnComplete: true,
        });

        await this.verificationCodeModel.create({
            code: resetCode,
            expiresAt: expiresAt,
            type: VerificationType.RESET_PASSWORD,
            user: savedUser._id,
        });

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            data: null
        }
        return appResponse;
    }

    async resetPassword(resetPasswordRequest: ResetPasswordRequestDto) {
        if (resetPasswordRequest.newPassword !== resetPasswordRequest.confirmNewPassword) {
            throw new BadRequestException('Passwords do not match');
        }

        let payload: CurrentUserDto;
        try {
            payload = await this.jwtService.verifyAsync(resetPasswordRequest.resetToken);
        } catch (error) {
            throw new BadRequestException(`Reset password fail: ${error.message}`);
        }

        const hashedNewPassword = await hash(resetPasswordRequest.newPassword, 10);
        await this.usersRepository.updateUser({_id: payload._id}, {password: hashedNewPassword});

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: 'Password reset successful! You can now log in with your new password',
            data: null
        };
        return appResponse;
    }

    async resendVerificationCode(resendCodeRequest: ResendCodeRequestDto) {
        if (resendCodeRequest.action === VerificationType.ACTIVATE_ACCOUNT) {
            return await this.resendCodeInRegistration(resendCodeRequest.academicEmail);
        } else if (resendCodeRequest.action === VerificationType.RESET_PASSWORD) {
            return await this.forgotPassword({academicEmail: resendCodeRequest.academicEmail});
        }
    }

    async refreshToken(refreshTokenRequest: RefreshTokenRequestDto) {
        let decoded: CurrentUserDto;
        try {
            decoded = await this.jwtService.verifyAsync(refreshTokenRequest.refreshToken, {
                secret: this.configService.getOrThrow(JWT_CONFIG.REFRESH_TOKEN_SECRET)
            });
        } catch (error) {
            throw new UnauthorizedException(`Refresh token fail: ${error.message}`);
        }

        const savedUser = await this.usersRepository.findUserWithRoles({_id: decoded._id});
        if (!savedUser || !savedUser.refreshToken) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        if (!(await compare(refreshTokenRequest.refreshToken, savedUser.refreshToken))) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const payload: CurrentUserDto = {
            _id: savedUser._id.toString(),
            academicEmail: savedUser.academicEmail,
            roles: savedUser.roles,
        };
        const tokens = await this.issueTokens(payload);

        const appResponse: AppResponseDto<LoginResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.authMapper.toLoginResponse(tokens, savedUser),
        };

        return appResponse;
    }

    private async verifyRegistration(verifyCodeRequest: VerifyCodeRequestDto, role: Roles) {
        const user = await this.usersRepository.findUser({
            academicEmail: verifyCodeRequest.academicEmail,
        });
        if (user) {
            throw new BadRequestException('Email already exists');
        }

        const cacheKey: string = `register:${verifyCodeRequest.academicEmail}`;
        const cachedUser = await this.cacheService
            .findItemByCacheKey(cacheKey) as CachedUserDto;
        if (!cachedUser) {
            throw new UnauthorizedException('Session expired, please register again');
        }

        if (verifyCodeRequest.code !== cachedUser.otp.code) {
            throw new BadRequestException('Invalid OTP');
        }

        const currDate = Date.now();
        if (currDate > cachedUser.otp.expiresIn) {
            throw new BadRequestException('OTP has expired');
        }

        const createdUser = await this.usersRepository.createUser({
            ...cachedUser,
            roles: [role._id]
        });

        await this.verificationCodeModel.create({
            code: cachedUser.otp.code,
            usedAt: currDate,
            expiresAt: new Date(cachedUser.otp.expiresIn),
            type: VerificationType.ACTIVATE_ACCOUNT,
            user: createdUser._id,
        });

        await this.cacheService.deleteItemByCacheKey(cacheKey);

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: 'Account activated successfully. You can now login',
            data: null
        };

        return appResponse;
    }

    private async verifyResetPasswordCode(verifyCodeRequest: VerifyCodeRequestDto) {
        const savedUser = await this.usersRepository.findUser({
            academicEmail: verifyCodeRequest.academicEmail
        });
        if (!savedUser) {
            throw new UnauthorizedException('The email that you\'ve entered is incorrect');
        }

        const savedCode = await this.verificationCodeModel.findOne({
            code: verifyCodeRequest.code,
            user: savedUser._id,
        });
        if (!savedCode) {
            throw new UnauthorizedException('The code that you\'ve entered is incorrect');
        }

        if (savedCode.expiresAt.getTime() < Date.now() || savedCode.usedAt) {
            throw new BadRequestException('The code is expired or already used')
        }

        savedCode.usedAt = new Date();
        await savedCode.save();

        const tokenPayload = {
            _id: savedUser._id.toString(),
            academicEmail: savedUser.academicEmail,
        }

        const resetToken: string = this.jwtService.sign(tokenPayload, {expiresIn: '5m'});

        const appResponse: AppResponseDto<{ resetToken: string }> = {
            status: HttpStatusText.SUCCESS,
            data: {resetToken}
        };

        return appResponse;
    }

    private async issueTokens(payload: CurrentUserDto) {
        const expiresAccessToken = new Date();
        expiresAccessToken.setTime(
            expiresAccessToken.getTime() + Number(
                this.configService.getOrThrow(JWT_CONFIG.ACCESS_TOKEN_EXPIRATION)
            )
        );

        const roles = payload.roles.map((role: any) => role.name) as string[];

        const tokenPayload: CurrentUserDto = {
            _id: payload._id,
            academicEmail: payload.academicEmail,
            roles: roles
        }

        const accessToken: string = this.jwtService.sign(tokenPayload);

        const refreshToken: string = this.jwtService.sign(tokenPayload, {
            secret: this.configService.getOrThrow(JWT_CONFIG.REFRESH_TOKEN_SECRET),
            expiresIn: `${this.configService.getOrThrow(JWT_CONFIG.REFRESH_TOKEN_EXPIRATION)}ms`
        });

        await this.usersRepository.updateUser({_id: payload._id}, {
            $set: {
                refreshToken: await hash(refreshToken, 10)
            }
        });

        return {
            accessToken,
            refreshToken,
            expiresIn: expiresAccessToken.getTime(),
        };
    }

    private async resendCodeInRegistration(academicEmail: string) {
        const user = await this.usersRepository.findUser({
            academicEmail: academicEmail,
        });
        if (user) {
            throw new BadRequestException('Email already exists');
        }

        const cacheKey: string = `register:${academicEmail}`;

        const cachedUser = await this.cacheService
            .findItemByCacheKey(cacheKey) as CachedUserDto;
        if (!cachedUser) {
            throw new UnauthorizedException('Session expired, please register again');
        }

        cachedUser.otp.code = generateOtp();
        cachedUser.otp.expiresIn = Date.now() + 300000;

        const mailDetails: SendMailDto = {
            to: academicEmail,
            name: cachedUser.name,
            subject: MAIL_CONTENT.ACTIVATION.SUBJECT,
            message: MAIL_CONTENT.ACTIVATION.MESSAGE,
            otp: cachedUser.otp.code,
            timeInMin: 5,
        };
        await this.mailQueue.add('sendOtpEmail', mailDetails, {
            attempts: 3,
            backoff: 3000,
            removeOnComplete: true,
        });

        await this.cacheService.createItem(`register:${academicEmail}`, cachedUser, 300000);
    }
}
