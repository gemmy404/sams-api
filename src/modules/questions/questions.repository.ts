import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model, QueryFilter} from "mongoose";
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

    async findAll(query: QueryFilter<Question>) {
        return this.questionsModel.find(query);
    }

}
