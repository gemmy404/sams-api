import {Module, ValidationPipe} from '@nestjs/common';
import {RolesModule} from './modules/roles/roles.module';
import {UsersModule} from './modules/users/users.module';
import {MongooseModule} from "@nestjs/mongoose";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {AuthModule} from "./modules/auth/auth.module";
import {CacheModule} from './modules/cache/cache.module';
import {MailModule} from './modules/mail/mail.module';
import {BullModule} from "@nestjs/bullmq";
import {CACHE_CONFIG} from "./common/constants/cache.constant";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                uri: configService.getOrThrow('MONGODB_URI'),
            }),
            inject: [ConfigService]
        }),
        BullModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                connection: {
                    host: configService.getOrThrow(CACHE_CONFIG.REDIS_HOST),
                    port: configService.getOrThrow(CACHE_CONFIG.REDIS_PORT),
                },
            }),
            inject: [ConfigService],
        }),
        RolesModule,
        UsersModule,
        AuthModule,
        CacheModule,
        MailModule
    ],
    providers: [
        {
            provide: 'APP_PIPE',
            useValue: new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        },
    ],
})
export class AppModule {
}
