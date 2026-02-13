import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {Users} from "../../users/schemas/users.schema";
import {Announcement} from "../../announcements/schemas/announcements.schema";

@Schema({timestamps: true})
export class Comment {
    _id?: Types.ObjectId;

    @Prop({
        type: String,
        required: true,
        maxlength: [1500, 'Content cannot be longer than 1500 characters'],
    })
    content: string;

    @Prop({
        type: Date,
        required: false,
        default: Date.now,
    })
    commentedAt: Date;

    @Prop({
        type: Types.ObjectId,
        ref: Users.name,
        required: true
    })
    author: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: Announcement.name,
        required: true
    })
    announcement: Types.ObjectId;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);