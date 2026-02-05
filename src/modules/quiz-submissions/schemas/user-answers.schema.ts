import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {Question} from "../../questions/schemas/questions.schema";
import {Option} from "../../questions/schemas/options.schema";

@Schema()
export class UserAnswer {
    _id?: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: Question.name,
        required: true,
    })
    question: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: Option.name,
        required: false,
    })
    selectedOption?: Types.ObjectId;

    @Prop({
        type: String,
        maxlength: [2000, 'Too many characters'],
        required: false,
    })
    writtenAnswer?: string;

    @Prop({
        type: Number,
        required: false,
        default: 0,
    })
    earnedPoints: number;

    @Prop({
        type: Boolean,
        required: false,
    })
    isCorrect?: boolean;
}

export const UserAnswerSchema = SchemaFactory.createForClass(UserAnswer);