import {AssignmentSubmission} from "./schemas/assignment-submissions.schema";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {AnyBulkWriteOperation, Model, PopulateOptions, QueryFilter, UpdateQuery} from "mongoose";

@Injectable()
export class AssignmentSubmissionsRepository {

    constructor(@InjectModel(AssignmentSubmission.name) private readonly assignmentSubmissionsModel: Model<AssignmentSubmission>) {
    }

    async createSubmission(submission: AssignmentSubmission) {
        return this.assignmentSubmissionsModel.create(submission);
    }

    async findAll(query: QueryFilter<AssignmentSubmission>) {
        return this.assignmentSubmissionsModel.find(query)
            .sort({createdAt: -1});
    }

    async findAllPaginated(
        query: QueryFilter<AssignmentSubmission>,
        select: Record<string, boolean> = {},
        populated: PopulateOptions[] = [],
        size: number, skip: number
    ) {
        const [savedSubmissions, totalElements] = await Promise.all([
            this.assignmentSubmissionsModel.find(query)
                .sort({createdAt: -1})
                .limit(size)
                .skip(skip)
                .select(select)
                .populate(populated),
            this.assignmentSubmissionsModel.countDocuments(query),
        ]);
        return {savedSubmissions, totalElements};
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

    async updateManySubmissions(
        query: QueryFilter<AssignmentSubmission>,
        updatedVal: UpdateQuery<AssignmentSubmission>
    ) {
        return this.assignmentSubmissionsModel.updateMany(query, updatedVal);
    }

    async bulkUpdateSubmissions(submissions: Array<AnyBulkWriteOperation<AssignmentSubmission>>) {
        return this.assignmentSubmissionsModel.bulkWrite(submissions);
    }

    async deleteAndReturn(query: QueryFilter<AssignmentSubmission>) {
        return this.assignmentSubmissionsModel.findOneAndDelete(query);
    }

    async deleteSubmission(query: QueryFilter<AssignmentSubmission>) {
        return this.assignmentSubmissionsModel.deleteMany(query);
    }

    async countSubmissions(query: QueryFilter<AssignmentSubmission>) {
        return this.assignmentSubmissionsModel.countDocuments(query);
    }

}
