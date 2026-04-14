import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {Assignment} from "../../assignments/schemas/assignments.schema";
import {Users} from "../../users/schemas/users.schema";
import {MediaItem, MediaItemSchema} from "../../../common/schemas/media-item.schema";
import {Course} from "../../courses/schemas/courses.schema";

@Schema({timestamps: true})
export class AssignmentSubmission {
    _id?: Types.ObjectId;

    @Prop({
        type: Date,
        required: false,
        default: Date.now,
    })
    submittedAt: Date;

    @Prop({
        type: Boolean,
        required: false,
        default: false,
    })
    neededReview: boolean;

    @Prop({
        type: Types.ObjectId,
        ref: Users.name,
        required: true,
    })
    student: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: Assignment.name,
        required: true,
    })
    assignment: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: Course.name,
        required: true,
    })
    course: Types.ObjectId;

    @Prop({
        type: [MediaItemSchema],
        required: false,
        default: [],
    })
    submittedItems: MediaItem[];
}

export const AssignmentSubmissionSchema = SchemaFactory.createForClass(AssignmentSubmission);