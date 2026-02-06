import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {Option, OptionSchema} from "./options.schema";
import {Quiz} from "../../quiz/schemas/quizzes.schema";
import {QuestionType} from "../enums/question-type.enum";

@Schema({timestamps: true})
export class Question {
    _id?: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: Quiz.name,
        required: true,
    })
    quiz: Types.ObjectId;

    @Prop({
        type: String,
        required: true
    })
    text: string;

    @Prop({
        type: String,
        enum: QuestionType,
        default: QuestionType.MCQ
    })
    questionType: QuestionType;

    @Prop({
        type: Number,
        required: false,
        default: 60,
        min: [1, 'Time limit must be greater than 0']
    })
    timeLimit: number;

    @Prop({
        type: Number,
        default: 1,
        min: [1, 'Points must be greater than 0'],
    })
    points: number;

    @Prop({
        type: [OptionSchema],
        required: false,
        default: undefined,
    })
    options?: Option[];
}

export const QuestionSchema = SchemaFactory.createForClass(Question);