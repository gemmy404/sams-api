import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {Users} from "../../users/schemas/users.schema";
import {Course} from "../../courses/schemas/courses.schema";

@Schema({timestamps: true})
export class Grade {
    _id?: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: Users.name,
        required: true,
    })
    student: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: Course.name,
        required: true,
    })
    course: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        required: true
    })
    classworkId: Types.ObjectId;

    @Prop({
        type: Number,
        required: false,
        default: 0
    })
    score: number;

    @Prop({
        type: Number,
        required: false,
        default: 1
    })
    maxScore: number;
}

export const GradeSchema = SchemaFactory.createForClass(Grade);