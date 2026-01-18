import {Module} from '@nestjs/common';
import {RolesModule} from './modules/roles/roles.module';
import {UsersModule} from './modules/users/users.module';
import {MongooseModule} from "@nestjs/mongoose";
import {ConfigModule, ConfigService} from "@nestjs/config";
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
        CacheModule
    ],
})
export class AppModule {
}
