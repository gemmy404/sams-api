import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Grade} from "./schemas/grades.schema";
import {Model, PopulateOptions, QueryFilter, QueryOptions, UpdateQuery} from "mongoose";

@Injectable()
export class GradesRepository {

    constructor(@InjectModel(Grade.name) private readonly gradesModel: Model<Grade>) {
    }

    async createGrade(grade: Grade) {
        return this.gradesModel.create(grade);
    }

    async findAll(query: QueryFilter<Grade>, populated: PopulateOptions[] = []) {
        return this.gradesModel.find(query)
            .populate(populated);
    }

    async updateGrade(
        query: QueryFilter<Grade>,
        updatedValue: UpdateQuery<Grade>,
        options: QueryOptions<Grade> = {new: true},
        ) {
        return this.gradesModel.findOneAndUpdate(query, updatedValue, options);
    }
}
