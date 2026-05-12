import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Roles} from "./schemas/roles.schema";
import {Model, QueryFilter} from "mongoose";
import {UserRoles} from "./enums/user-roles.enum";

@Injectable()
export class RolesRepository {

    constructor(@InjectModel(Roles.name) private readonly rolesModel: Model<Roles>) {
    }

    async createRole(roleName: UserRoles) {
        return this.rolesModel.create({name: roleName});
    }

    async findRole(query: QueryFilter<Roles>) {
        return this.rolesModel.findOne(query);
    }

    async findAll() {
        return this.rolesModel.find({}, {__v: false});
    }

    async findRoleByNameOrCreate(name: UserRoles) {
        const role = await this.rolesModel.findOne({name}, {__v: false});
        if (!role) {
            return this.createRole(name);
        }
        return role;
    }
}
