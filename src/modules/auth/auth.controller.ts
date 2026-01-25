import {Body, Controller, HttpCode, HttpStatus, Patch, Post, UseGuards} from '@nestjs/common';
import {AuthService} from './auth.service';
import {RegisterRequestDto} from "./dto/register-request.dto";
import {LoginRequestDto} from "./dto/login-request.dto";
import {VerifyCodeRequestDto} from "./dto/verify-code-request.dto";
import {ForgotPasswordRequestDto} from "./dto/forgot-password-request.dto";
import {ResetPasswordRequestDto} from "./dto/reset-password-request.dto";
import {ResendCodeRequestDto} from "./dto/resend-code-request.dto";
import {JwtAuthGuard} from "./guards/jwt-auth.guard";
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {RefreshTokenRequestDto} from "./dto/refresh-token-request.dto";
import {ApiResponse} from "@nestjs/swagger";
import {LoginResponseDto} from "./dto/login-response.dto";
import {AppResponseDto} from "../../common/dto/app-response.dto";

@Controller('api/v1/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post('register')
    register(@Body() registerRequest: RegisterRequestDto): Promise<AppResponseDto<null>> {
        return this.authService.register(registerRequest);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({type: LoginResponseDto})
    login(@Body() loginRequest: LoginRequestDto): Promise<AppResponseDto<LoginResponseDto>> {
        return this.authService.login(loginRequest);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    logout(@CurrentUser() currentUserDto: CurrentUserDto): Promise<AppResponseDto<null>> {
        return this.authService.logout(currentUserDto);
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    forgotPassword(@Body() forgotPasswordRequest: ForgotPasswordRequestDto): Promise<AppResponseDto<null>> {
        return this.authService.forgotPassword(forgotPasswordRequest);
    }

    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    verifyOtp(@Body() verifyCodeRequestDto: VerifyCodeRequestDto) {
        return this.authService.verifyOtp(verifyCodeRequestDto);
    }

    @Patch('reset-password')
    resetPassword(@Body() resetPasswordRequest: ResetPasswordRequestDto): Promise<AppResponseDto<null>> {
        return this.authService.resetPassword(resetPasswordRequest);
    }

    @Post('resend-code')
    @HttpCode(HttpStatus.OK)
    resendVerificationCode(@Body() resendCodeRequest: ResendCodeRequestDto): Promise<void | AppResponseDto<null>> {
        return this.authService.resendVerificationCode(resendCodeRequest);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({type: LoginResponseDto})
    refreshToken(@Body() refreshTokenRequest: RefreshTokenRequestDto): Promise<AppResponseDto<LoginResponseDto>> {
        return this.authService.refreshToken(refreshTokenRequest);
    }
}
