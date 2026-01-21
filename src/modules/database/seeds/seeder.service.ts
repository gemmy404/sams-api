import {Injectable, Logger, OnApplicationBootstrap} from '@nestjs/common';
import {RolesRepository} from "../../roles/roles.repository";

@Injectable()
export class SeederService implements OnApplicationBootstrap {

    private readonly logger: Logger = new Logger(SeederService.name);

    constructor(private readonly rolesRepository: RolesRepository) {
    }

    async onApplicationBootstrap() {
        await this.seedRoles();
    }

    private async seedRoles() {
        const rolesToCreate: string[] = ['student', 'instructor', 'admin'];

        for (const roleName of rolesToCreate) {
            const exists = await this.rolesRepository.findRoleByName(roleName);

            if (!exists) {
                await this.rolesRepository.createRole(roleName);
                this.logger.log(`Role ${roleName} created successfully`)
            }
        }
    }
}