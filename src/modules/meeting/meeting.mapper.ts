import {Injectable} from "@nestjs/common";
import {Meeting} from "./schemas/meeting.schema";
import {MeetingResponseDto} from "./dto/meeting-response.dto";

@Injectable()
export class MeetingMapper {

    toMeetingResponse(this: void, meeting: Meeting): MeetingResponseDto {
        const duration = meeting.endTime
            ? (meeting.endTime.getTime() - meeting.startTime.getTime()) / (1000 * 60)
            : 0;
        return {
            _id: meeting._id!.toString(),
            channelName: meeting.channelName,
            startTime: meeting.startTime.toLocaleString(),
            endTime: meeting.endTime?.toLocaleString() || null,
            duration:Number( duration.toFixed(0)),
            status: meeting.status,
        };
    }

}