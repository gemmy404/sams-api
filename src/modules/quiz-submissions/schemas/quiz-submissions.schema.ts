import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {Users} from "../../users/schemas/users.schema";
import {Quiz} from "../../quiz/schemas/quizzes.schema";
import {SubmissionStatus} from "../enums/submission-status.enum";
import {UserAnswer, UserAnswerSchema} from "./user-answers.schema";

@Schema({timestamps: true})
export class QuizSubmission {
    _id?: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: Users.name,
        required: true,
    })
    student: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: Quiz.name,
        required: true,
    })
    quiz: Types.ObjectId;

    @Prop({
        type: Date,
        required: false,
        default: Date.now,
    })
    startedAt: Date;

    @Prop({
        type: Date,
        required: false,
    })
    submittedAt: Date;

    @Prop({
        type: Date,
        required: false,
    })
    gradedAt: Date;

    @Prop({
        type: Number,
        required: false,
        default: 0,
    })
    totalScore: number;

    @Prop({
        type: String,
        enum: SubmissionStatus,
        required: false,
        default: SubmissionStatus.STARTED,
    })
    status: SubmissionStatus;

    @Prop({
        type: [UserAnswerSchema],
        required: false,
        maxlength: [150, 'Too many answers'],
        default: [],
    })
    answers: UserAnswer[];
}

export const QuizSubmissionSchema = SchemaFactory.createForClass(QuizSubmission);