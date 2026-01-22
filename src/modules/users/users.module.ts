import {Module} from '@nestjs/common';
import {UsersService} from './users.service';
import {UsersController} from './users.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Users, UserSchema} from "./schemas/users.schema";
import {UsersRepository} from "./users.repository";
import {UsersMapper} from "./users.mapper";
import {S3Module} from "../s3/s3.module";
import {RolesModule} from "../roles/roles.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Users.name, schema: UserSchema},
        ]),
        S3Module,
        RolesModule
    ],
    controllers: [UsersController],
    providers: [UsersService, UsersRepository, UsersMapper],
    exports: [UsersRepository, UsersMapper],
})
export class UsersModule {
}
