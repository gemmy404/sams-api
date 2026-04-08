import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {Course} from "../../courses/schemas/courses.schema";
import {MediaItem, MediaItemSchema} from "../../../common/schemas/media-item.schema";

@Schema({timestamps: true})
export class Assignment {
    _id?: Types.ObjectId;

    @Prop({
        type: String,
        required: true,
        maxlength: [50, 'Title must not exceed 50 characters'],
    })
    title: string;

    @Prop({
        type: String,
        required: false,
        maxlength: [100, 'Description must not exceed 100 characters'],
    })
    description: string;

    createdAt?: Date;

    @Prop({
        type: Date,
        required: true,
    })
    dueDate: Date;

    @Prop({
        type: Boolean,
        required: false,
        default: false,
    })
    enablePlagiarismCheck: boolean;

    @Prop({
        type: Number,
        required: false,
        min: [0, 'Plagiarism threshold must be greater than or equal to 0'],
        max: [100, 'Plagiarism threshold must be less than or equal to 100'],
    })
    plagiarismThreshold: number;

    @Prop({
        type: Types.ObjectId,
        ref: Course.name,
        required: true,
    })
    course: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        required: true,
    })
    classworkId: Types.ObjectId;

    @Prop({
        type: [MediaItemSchema],
        required: false,
        default: [],
    })
    assignmentItems: MediaItem[];
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);