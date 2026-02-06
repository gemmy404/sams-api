import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Quiz} from "./schemas/quizzes.schema";
import {Model, QueryFilter, UpdateQuery} from "mongoose";

@Injectable()
export class QuizzesRepository {

    constructor(
        @InjectModel(Quiz.name) private readonly quizzesModel: Model<Quiz>,
    ) {
    }

    async createQuiz(quiz: any) {
        return this.quizzesModel.create(quiz);
    }

    async findAll(query: QueryFilter<Quiz>) {
        return this.quizzesModel.find(query);
    }

    async findQuiz(query: QueryFilter<Quiz>) {
        return this.quizzesModel.findOne(query);
    }

    async updateQuiz(query: QueryFilter<Quiz>, updatedValue: UpdateQuery<Quiz>) {
        return this.quizzesModel.findOneAndUpdate(query, updatedValue, {new: true});
    }

}
