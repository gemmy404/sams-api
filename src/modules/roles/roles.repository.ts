import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Roles} from "./schemas/roles.schema";
import {Model} from "mongoose";

@Injectable()
export class RolesRepository {

    constructor(@InjectModel(Roles.name) private readonly rolesModel: Model<Roles>) {
    }

    async createRole(roleName: string) {
        return this.rolesModel.create({name: roleName});
    }

    async findAll() {
        return this.rolesModel.find({}, {__v: false});
    }

    async findRoleByNameOrCreate(name: string) {
        const role = await this.rolesModel.findOne({name}, {__v: false});
        if (!role) {
            return this.createRole(name);
        }
        return role;
    }
}
