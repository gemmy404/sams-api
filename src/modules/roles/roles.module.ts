import {Module} from '@nestjs/common';
import {RolesService} from './roles.service';
import {MongooseModule} from "@nestjs/mongoose";
import {Roles, RoleSchema} from "./schemas/roles.schema";
import {RolesRepository} from "./roles.repository";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Roles.name, schema: RoleSchema}
        ])
    ],
    providers: [RolesService, RolesRepository],
    exports: [RolesRepository],
})
export class RolesModule {
}
