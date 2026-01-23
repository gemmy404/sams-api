import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Users} from "./schemas/users.schema";
import {Model, QueryFilter, UpdateQuery} from "mongoose";
import {RolesRepository} from "../roles/roles.repository";

@Injectable()
export class UsersRepository {

    constructor(
        @InjectModel(Users.name) private readonly usersModel: Model<Users>,
        private readonly rolesRepository: RolesRepository,
    ) {
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

    async findAll(
        query: QueryFilter<Users>,
        sortBy: string, sortOrder: string, locale: string,
        size: number, skip: number
    ) {
        const [users, totalElements] = await Promise.all([
            this.usersModel.find(query)
                .sort({[sortBy]: sortOrder === 'asc' ? 1 : -1})
                .collation({locale: locale === 'ar' ? 'ar' : 'en', strength: 2})
                .limit(size)
                .skip(skip)
                .populate('roles', {name: true}),
            this.usersModel.countDocuments(query)
        ]);

        return {users, totalElements};
    }

}
