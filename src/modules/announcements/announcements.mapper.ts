import {Announcement} from "./schemas/announcements.schema";
import {AnnouncementResponseDto} from "./dto/announcement-response.dto";
import {Injectable} from "@nestjs/common";

@Injectable()
export class AnnouncementsMapper {

    toAnnouncementResponse(this: void, announcement: Announcement): AnnouncementResponseDto {
        return {
            _id: announcement._id!.toString(),
            title: announcement.title,
            content: announcement.content,
        };
    }
}