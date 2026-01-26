import {Injectable, Logger, OnApplicationBootstrap} from '@nestjs/common';
import {RolesRepository} from "../../roles/roles.repository";
import {ConfigService} from "@nestjs/config";
import {UsersRepository} from "../../users/users.repository";
import {hash} from "bcryptjs";

@Injectable()
export class SeederService implements OnApplicationBootstrap {

    private readonly logger: Logger = new Logger(SeederService.name);

    constructor(
        private readonly rolesRepository: RolesRepository,
        private readonly usersRepository: UsersRepository,
        private readonly configService: ConfigService,
    ) {
    }

    async onApplicationBootstrap() {
        await this.seedRoles();
        await this.seedAdmin();
    }

    private async seedRoles() {
        const rolesToCreate: string[] = ['student', 'instructor', 'admin'];

        for (const roleName of rolesToCreate) {
            const exists = await this.rolesRepository.findRole({name: roleName});

            if (!exists) {
                await this.rolesRepository.createRole(roleName);
                this.logger.log(`Role ${roleName} created successfully`)
            }
        }
    }

    private async seedAdmin() {
        const config = {
            email: this.configService.get<string>('INITIAL_ADMIN_EMAIL'),
            password: this.configService.get<string>('INITIAL_ADMIN_PASSWORD'),
            name: this.configService.get<string>('INITIAL_ADMIN_NAME'),
            id: this.configService.get<string>('INITIAL_ADMIN_ID'),
        };

        if (Object.values(config).some(val => !val)) {
            this.logger.warn('Seed Admin: Missing variables in .env, skipping...');
            return;
        }

        const adminExists = await this.usersRepository.findUser({
            academicEmail: config.email
        });
        if (!adminExists) {
            const hashedPassword = await hash(config.password!, 10);

            const adminRole = await this.rolesRepository.findRole({name: 'admin'});
            if (!adminRole) {
                this.logger.error('Seed Admin: Role "admin" not found. Make sure seedRoles runs first!');
                return;
            }

            await this.usersRepository.createUser({
                name: config.name!,
                academicEmail: config.email!,
                password: hashedPassword,
                academicId: config.id!,
                roles: [adminRole._id],
                isActive: true,
            });

            this.logger.log(`Admin (${config.name}) initialized successfully`);
        } else {
            this.logger.log(`Admin (${config.name}) is already up to date`);
        }

    }
}