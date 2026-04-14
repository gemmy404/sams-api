import {AssignmentSubmission} from "./schemas/assignment-submissions.schema";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model, PopulateOptions, QueryFilter, UpdateQuery} from "mongoose";

@Injectable()
export class AssignmentSubmissionsRepository {

    constructor(@InjectModel(AssignmentSubmission.name) private readonly assignmentSubmissionsModel: Model<AssignmentSubmission>) {
    }

    async createSubmission(submission: AssignmentSubmission) {
        return this.assignmentSubmissionsModel.create(submission);
    }

    async findAll(
        query: QueryFilter<AssignmentSubmission>,
        select: Record<string, boolean> = {},
        populated: PopulateOptions[] = []
    ) {
        return this.assignmentSubmissionsModel.find(query)
            .sort({createdAt: -1})
            .select(select)
            .populate(populated);
    }

    async findOne(query: QueryFilter<AssignmentSubmission>, populated: PopulateOptions[] = []) {
        return this.assignmentSubmissionsModel.findOne(query)
            .populate(populated);
    }

    async updateSubmission(
        query: QueryFilter<AssignmentSubmission>,
        updatedVal: UpdateQuery<AssignmentSubmission>,
        populated: PopulateOptions[] = []
    ) {
        return this.assignmentSubmissionsModel.findOneAndUpdate(query, updatedVal, {new: true})
            .populate(populated);
    }

    async deleteAndReturn(query: QueryFilter<AssignmentSubmission>) {
        return this.assignmentSubmissionsModel.findOneAndDelete(query);
    }


    async deleteSubmission(query: QueryFilter<AssignmentSubmission>) {
        return this.assignmentSubmissionsModel.deleteMany(query);
    }

}
