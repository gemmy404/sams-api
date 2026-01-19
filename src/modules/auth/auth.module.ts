import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {AuthController} from './auth.controller';
import {JwtModule} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";
import {PassportModule} from "@nestjs/passport";
import {UsersModule} from "../users/users.module";
import {RolesModule} from "../roles/roles.module";
import {JWT_CONFIG} from "../../common/constants/jwt.constant";
import {AuthMapper} from "./auth.mapper";
import {CacheModule} from "../cache/cache.module";
import {MongooseModule} from "@nestjs/mongoose";
import {VerificationCode, VerificationCodeSchema} from "./schemas/verification-codes.schema";
import {MailModule} from "../mail/mail.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: VerificationCode.name, schema: VerificationCodeSchema},
        ]),
        JwtModule.registerAsync({
            global: true,
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow(JWT_CONFIG.ACCESS_TOKEN_SECRET),
                signOptions: {
                    expiresIn: `${configService.getOrThrow(JWT_CONFIG.ACCESS_TOKEN_EXPIRATION)}ms`
                },
            }),
            inject: [ConfigService]
        }),
        PassportModule,
        UsersModule,
        RolesModule,
        CacheModule,
        MailModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, AuthMapper],
})
export class AuthModule {
}
