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
import {ValidationException} from "./common/exceptions/validation.exception";
import {S3Module} from './modules/s3/s3.module';
import {SeederModule} from './modules/database/seeds/seeder.module';
import {AdminModule} from "./modules/admin/admin.module";
import {CoursesModule} from './modules/courses/courses.module';
import {InstructorModule} from "./modules/instructor/instructor.module";
import {EnrollmentsModule} from "./modules/enrollments/enrollments.module";
import { MaterialsModule } from './modules/materials/materials.module';
import {ValidationError} from "class-validator";

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
        MailModule,
        S3Module,
        SeederModule,
        AdminModule,
        CoursesModule,
        InstructorModule,
        EnrollmentsModule
    ],
    providers: [
        {
            provide: 'APP_PIPE',
            useValue: new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
                exceptionFactory: (errors: ValidationError[]) => {
                    const extractErrors = (errorList: ValidationError[]) => {
                        return errorList.flatMap((err: ValidationError) => {
                            const constraints: string[] = err.constraints ? Object.values(err.constraints) : [];
                            const childErrors: string[] = err.children ? extractErrors(err.children) : [];
                            return [...constraints, ...childErrors];
                        });
                    };
                    const messages: string[] = extractErrors(errors);

                    return new ValidationException(messages, 400);
                },
            }),
        },
    ],
})
export class AppModule {
}
