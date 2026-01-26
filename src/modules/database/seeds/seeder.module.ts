import { Module } from '@nestjs/common';
import {SeederService} from "./seeder.service";
import {RolesModule} from "../../roles/roles.module";
import {UsersModule} from "../../users/users.module";

@Module({
    imports: [
        RolesModule,
        UsersModule,
    ],
    providers: [SeederService]
})
export class SeederModule {}
