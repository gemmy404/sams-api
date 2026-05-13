import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {Users} from "../../users/schemas/users.schema";
import {Course} from "../../courses/schemas/courses.schema";
import {MeetingStatus} from "../enums/meeting-status.enum";

@Schema({timestamps: true})
export class Meeting {
    _id?: Types.ObjectId;

    @Prop({
        type: String,
        required: true,
        unique: true,
    })
    channelName: string;


    @Prop({
        type: String,
        required: true,
        enum: MeetingStatus,
    })
    status: MeetingStatus;

    @Prop({
        type: Date,
        required: true,
    })
    startTime: Date;

    @Prop({
        type: Date,
        required: false,
    })
    endTime?: Date;

    @Prop({
        type: Types.ObjectId,
        ref: Course.name,
        required: true
    })
    course: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: Users.name,
        required: true,
    })
    instructor: Types.ObjectId;
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);