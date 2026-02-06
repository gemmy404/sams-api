import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {Course} from "../../courses/schemas/courses.schema";
import {QuizStatus} from "../enums/quiz-status.enum";
import {GradingType} from "../enums/grading-type.enum";


@Schema({timestamps: true})
export class Quiz {
    _id?: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: Course.name,
        required: true,
    })
    course: Types.ObjectId;

    @Prop({
        type: String,
        required: true,
    })
    title: string;

    @Prop({
        type: String,
        required: false,
    })
    description: string;

    @Prop({
        type: Date,
        required: true,
    })
    startTime: Date;

    @Prop({
        type: Date,
        required: true,
    })
    endTime: Date;

    @Prop({
        type: Number,
        required: false,
        default: 0,
    })
    totalTime: number; // in min

    @Prop({
        type: Number,
        required: false,
        default: 0,
    })
    totalScore: number;

    @Prop({
        type: Number,
        required: false,
        default: 0,
    })
    numberOfQuestions: number;

    @Prop({
        type: Boolean,
        required: false,
        default: false,
    })
    isPublished: boolean;

    @Prop({
        type: String,
        enum: GradingType,
        default: GradingType.AUTOMATIC,
    })
    gradingType: GradingType;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

QuizSchema.virtual('status').get(function (this: Quiz): QuizStatus {
    if (!this.isPublished) {
        return QuizStatus.DRAFT;
    }

    const now = new Date();
    const start = new Date(this.startTime);
    const end = new Date(this.endTime);

    if (now < start) {
        return QuizStatus.SCHEDULED;
    } else if (now >= start && now <= end) {
        return QuizStatus.ACTIVE;
    } else {
        return QuizStatus.CLOSED;
    }
});

QuizSchema.set('toJSON', {virtuals: true});
QuizSchema.set('toObject', {virtuals: true});