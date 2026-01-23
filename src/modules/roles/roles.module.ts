import {Module} from '@nestjs/common';
import {RolesService} from './roles.service';
import {MongooseModule} from "@nestjs/mongoose";
import {Roles, RoleSchema} from "./schemas/roles.schema";
import {RolesRepository} from "./roles.repository";
import {RolesMapper} from "./roles.mapper";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Roles.name, schema: RoleSchema}
        ])
    ],
    providers: [RolesService, RolesRepository, RolesMapper],
    exports: [RolesRepository, RolesMapper],
})
export class RolesModule {
}
