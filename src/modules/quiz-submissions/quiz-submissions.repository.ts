import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {QuizSubmission} from "./schemas/quiz-submissions.schema";
import {Model, QueryFilter, UpdateQuery} from "mongoose";

@Injectable()
export class QuizSubmissionsRepository {

    constructor(
        @InjectModel(QuizSubmission.name) private readonly quizSubmissionsModel: Model<QuizSubmission>,
    ) {
    }

    async createSubmission(submission: QuizSubmission) {
        return this.quizSubmissionsModel.create(submission);
    }

    async findSubmission(query: QueryFilter<QuizSubmission>) {
        return this.quizSubmissionsModel.findOne(query);
    }

    async updateSubmission(query: QueryFilter<QuizSubmission>, updatedValue: UpdateQuery<QuizSubmission>) {
        return this.quizSubmissionsModel.findOneAndUpdate(query, updatedValue, {new: true});
    }
}
