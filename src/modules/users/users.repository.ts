import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Users} from "./schemas/users.schema";
import {Model} from "mongoose";

@Injectable()
export class UsersRepository {

    constructor(@InjectModel(Users.name) private readonly usersModel: Model<Users>) {
    }

    async createUser(user: Users) {
        return this.usersModel.create(user);
    }

}
