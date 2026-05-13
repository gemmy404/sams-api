import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Meeting} from "./schemas/meeting.schema";
import {Model, QueryFilter, Types} from "mongoose";
import {MeetingStatus} from "./enums/meeting-status.enum";

@Injectable()
export class MeetingRepository {

    constructor(
        @InjectModel(Meeting.name) private readonly meetingModel: Model<Meeting>,
    ) {
    }

    async createMeeting(meeting: Meeting) {
        return this.meetingModel.create(meeting);
    }

    async findMeeting(query: QueryFilter<Meeting>) {
        return this.meetingModel.findOne(query);
    }

    async findAllMeetings(query?: QueryFilter<Meeting>) {
        return this.meetingModel.find(query)
            .sort({createdAt: -1});
    }

    async changeStatus(meetingId: Types.ObjectId, newVal: { newStatus: MeetingStatus, endTime?: Date }) {
        return this.meetingModel.findByIdAndUpdate(meetingId,
            {status: newVal.newStatus, endTime: newVal.endTime},
            {returnDocument: 'after'});
    }

    async deleteMeeting(meetingId: Types.ObjectId) {
        return this.meetingModel.findByIdAndDelete(meetingId);
    }

}
