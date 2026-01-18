import {Module} from '@nestjs/common';
import {RolesModule} from './roles/roles.module';
import {UsersModule} from './users/users.module';
import {MongooseModule} from "@nestjs/mongoose";
import {ConfigModule, ConfigService} from "@nestjs/config";

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
        UsersModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
}
