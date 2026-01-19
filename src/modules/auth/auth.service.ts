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
            subject: 'Welcome to O6U - Verify Your Academic Email',
            message: 'Welcome to October 6 University! To activate your account,' +
                ' please use the following verification code:',
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
            // Reset password flow
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

    async issueTokens(payload: CurrentUserDto) {
        const expiresAccessToken = new Date();
        expiresAccessToken.setTime(
            expiresAccessToken.getTime() + Number(
                this.configService.getOrThrow(JWT_CONFIG.ACCESS_TOKEN_EXPIRATION)
            )
        );

        const tokenPayload: CurrentUserDto = {
            _id: payload._id,
            academicEmail: payload.academicEmail,
            roles: payload.roles
        }

        const accessToken: string = this.jwtService.sign(tokenPayload);

        const refreshToken: string = this.jwtService.sign(tokenPayload, {
            secret: this.configService.getOrThrow(JWT_CONFIG.REFRESH_TOKEN_SECRET),
            expiresIn: `${this.configService.getOrThrow(JWT_CONFIG.ACCESS_TOKEN_EXPIRATION)}ms`
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

}
