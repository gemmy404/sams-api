import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Roles} from "./schemas/roles.schema";
import {Model} from "mongoose";

@Injectable()
export class RolesRepository {

    constructor(@InjectModel(Roles.name) private readonly rolesModel: Model<Roles>) {
    }

    async createRole(role: Roles) {
        return this.rolesModel.create(role);
    }

    async findAll() {
        return this.rolesModel.find({}, {__v: false});
    }

    async findRoleByName(name: string) {
        return this.rolesModel.findOne({name}, {__v: false});
    }
}
