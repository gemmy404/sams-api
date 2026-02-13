import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {Users} from "../../users/schemas/users.schema";
import {Course} from "../../courses/schemas/courses.schema";

@Schema({timestamps: true})
export class Announcement {
    _id?: Types.ObjectId;

    @Prop({
        type: String,
        required: true,
        maxlength: [30, 'Title cannot be longer than 30 characters'],
    })
    title: string;

    @Prop({
        type: String,
        required: true,
        maxlength: [2000, 'Content cannot be longer than 2000 characters'],
    })
    content: string;

    @Prop({
        type: Types.ObjectId,
        ref: Users.name,
        required: true
    })
    instructor: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: Course.name,
        required: true
    })
    course: Types.ObjectId;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);