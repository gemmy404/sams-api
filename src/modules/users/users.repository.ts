import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Users} from "./schemas/users.schema";
import {Model, QueryFilter, UpdateQuery} from "mongoose";

@Injectable()
export class UsersRepository {

    constructor(@InjectModel(Users.name) private readonly usersModel: Model<Users>) {
    }

    async createUser(user: Users) {
        return this.usersModel.create(user);
    }

    async updateUser(query: QueryFilter<Users>, data: UpdateQuery<Users>) {
        return this.usersModel.findOneAndUpdate(query, data, {new: true});
    }

    async findUser(query: QueryFilter<Users>) {
        return this.usersModel.findOne(query);
    }

    async findUserWithRoles(query: QueryFilter<Users>) {
        return this.usersModel.findOne(query)
            .populate('roles', {name: true});
    }

}
