import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model, QueryFilter, UpdateQuery} from "mongoose";
import {Question} from "./schemas/questions.schema";

@Injectable()
export class QuestionsRepository {

    constructor(
        @InjectModel(Question.name) private readonly questionsModel: Model<Question>,
    ) {
    }

    async insertQuestions(questions: Question[]) {
        return this.questionsModel.insertMany(questions);
    }

    async findAll(query: QueryFilter<Question>, selected: Record<string, boolean> = {}) {
        return this.questionsModel.find(query)
            .select(selected);
    }

    async findQuestion(query: QueryFilter<Question>, selected: Record<string, boolean> = {}) {
        return this.questionsModel.findOne(query)
            .select(selected)
            .populate({
                path: 'quiz',
                populate: {
                    path: 'course',
                    select: {_id: true}
                }
            });
    }

    async updateQuestion(query: QueryFilter<Question>, updatedValue: UpdateQuery<Question>) {
        return this.questionsModel.findOneAndUpdate(query, updatedValue, {new: true});
    }

    async deleteQuestion(query: QueryFilter<Question>) {
        return this.questionsModel.findOneAndDelete(query)
            .populate('quiz');
    }

}
