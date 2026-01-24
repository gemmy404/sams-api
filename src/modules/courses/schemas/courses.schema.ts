import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {Users} from "../../users/schemas/users.schema";
import {Classwork, ClassworkSchema} from "./classwork.schema";

@Schema({timestamps: true})
export class Course {
    _id: Types.ObjectId;

    @Prop({
        type: String,
        required: true,
    })
    name: string;

    @Prop({
        type: String,
        required: true,
    })
    academicCourseCode: string;

    @Prop({
        type: Number,
        required: true,
    })
    totalGrades: number;

    @Prop({
        type: Number,
        required: true,
    })
    finalExam: number;

    @Prop({
        type: String,
        required: true,
        unique: true,
    })
    courseInvitationCode: string;

    @Prop({
        type: Types.ObjectId,
        ref: Users.name,
        required: true,
    })
    instructor: Types.ObjectId;

    @Prop({
        type: [ClassworkSchema],
        required: false,
        default: []
    })
    classwork: Classwork[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);