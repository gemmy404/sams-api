import {Body, Controller, HttpCode, HttpStatus, Post} from '@nestjs/common';
import {AuthService} from './auth.service';
import {RegisterRequestDto} from "./dto/register-request.dto";
import {LoginRequestDto} from "./dto/login-request.dto";
import {VerifyCodeRequestDto} from "./dto/verify-code-request.dto";

@Controller('api/v1/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post('register')
    register(@Body() registerRequest: RegisterRequestDto) {
        return this.authService.register(registerRequest);
    }

    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    verifyOtp(@Body() verifyCodeRequestDto: VerifyCodeRequestDto) {
        return this.authService.verifyOtp(verifyCodeRequestDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() loginRequest: LoginRequestDto) {
        return this.authService.login(loginRequest);
    }

}
