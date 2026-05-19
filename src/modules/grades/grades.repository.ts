import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Grade} from "./schemas/grades.schema";
import {AnyBulkWriteOperation, Model, PopulateOptions, QueryFilter, QueryOptions, Types, UpdateQuery} from "mongoose";

@Injectable()
export class GradesRepository {

    constructor(@InjectModel(Grade.name) private readonly gradesModel: Model<Grade>) {
    }

    async createGrade(grade: Grade) {
        return this.gradesModel.create(grade);
    }

    async createManyGrades(grades: Array<AnyBulkWriteOperation<Grade>>) {
        return this.gradesModel.bulkWrite(grades);
    }

    async findOne(query: QueryFilter<Grade>) {
        return this.gradesModel.findOne(query);
    }

    async findAll(query: QueryFilter<Grade>, populated: PopulateOptions[] = []) {
        return this.gradesModel.find(query)
            .populate(populated);
    }

    async findGradeMaxScoresByCourseId(course: Types.ObjectId) {
        return this.gradesModel.find({course: course})
            .sort({createdAt: -1})
            .select({maxScore: true, classworkId: true});
    }

    async updateGrade(
        query: QueryFilter<Grade>,
        updatedValue: UpdateQuery<Grade>,
        options: QueryOptions<Grade> = {new: true},
        ) {
        return this.gradesModel.findOneAndUpdate(query, updatedValue, options);
    }

    async deleteGrade(query: QueryFilter<Grade>) {
        return this.gradesModel.findOneAndDelete(query);
    }

    async deleteGrades(query: QueryFilter<Grade>) {
        return this.gradesModel.deleteMany(query);
    }
}
