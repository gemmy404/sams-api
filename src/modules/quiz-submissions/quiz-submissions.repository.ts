import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {QuizSubmission} from "./schemas/quiz-submissions.schema";
import {Model, QueryFilter, QueryOptions, UpdateQuery} from "mongoose";

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

    async findSubmissionWithQuestion(query: QueryFilter<QuizSubmission>) {
        return this.quizSubmissionsModel.findOne(query)
            .populate('answers.question');
    }

    async findAll(query: QueryFilter<QuizSubmission>, size: number, skip: number) {
        const [submissions, totalElements] = await Promise.all([
            this.quizSubmissionsModel.find(query)
                .sort({submittedAt: 1})
                .limit(size)
                .skip(skip)
                .populate('student', {name: true, academicId: true}),
            this.quizSubmissionsModel.countDocuments(query),
        ]);

        return {submissions, totalElements};
    }

    async updateSubmission(
        query: QueryFilter<QuizSubmission>,
        updatedValue: UpdateQuery<QuizSubmission>,
        options: QueryOptions<QuizSubmission> = {new: true}
    ) {
        return this.quizSubmissionsModel.findOneAndUpdate(query, updatedValue, options);
    }
}
