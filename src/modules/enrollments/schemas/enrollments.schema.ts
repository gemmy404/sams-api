import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {Course} from "../../courses/schemas/courses.schema";
import {Users} from "../../users/schemas/users.schema";

@Schema({timestamps: true})
export class Enrollment {
    _id: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: Users.name,
        required: true,
    })
    user: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: Course.name,
        required: true,
    })
    course: Types.ObjectId;

    @Prop({
        type: Date,
        default: Date.now,
    })
    enrolledAt: Date;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);