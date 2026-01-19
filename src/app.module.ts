import {Module, ValidationPipe} from '@nestjs/common';
import {RolesModule} from './modules/roles/roles.module';
import {UsersModule} from './modules/users/users.module';
import {MongooseModule} from "@nestjs/mongoose";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {AuthModule} from "./modules/auth/auth.module";
import {CacheModule} from './modules/cache/cache.module';

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
        RolesModule,
        UsersModule,
        AuthModule,
        CacheModule,
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
