import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Assignment} from "./schemas/assignments.schema";
import {Model, QueryFilter, UpdateQuery} from "mongoose";

@Injectable()
export class AssignmentsRepository {

    constructor(@InjectModel(Assignment.name) private readonly assignmentsModel: Model<Assignment>) {
    }

    async createAssignment(assignment: Assignment) {
        return this.assignmentsModel.create(assignment);
    }

    async findAll(query: QueryFilter<Assignment>, select: Record<string, boolean>) {
        return this.assignmentsModel.find(query)
            .sort({createdAt: -1})
            .select(select);
    }

    async findOne(query: QueryFilter<Assignment>) {
        return this.assignmentsModel.findOne(query);
    }

    async findAssignmentOwner(query: QueryFilter<Assignment>) {
        return this.assignmentsModel.findOne(query)
            .select({assignmentItems: false})
            .populate({
                path: 'course',
                select: 'instructor',
                populate: {
                    path: 'instructor',
                    select: '_id'
                }
            });
    }

    async updateAssignment(query: QueryFilter<Assignment>, updatedVal: UpdateQuery<Assignment>) {
        return this.assignmentsModel.findOneAndUpdate(query, updatedVal, {new: true});
    }

    async deleteAndReturn(query: QueryFilter<Assignment>) {
        return this.assignmentsModel.findOneAndDelete(query);
    }

}
