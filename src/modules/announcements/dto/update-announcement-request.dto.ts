import {PartialType} from "@nestjs/swagger";
import {CreateAnnouncementRequestDto} from "./create-announcement-request.dto";

export class UpdateAnnouncementRequestDto extends PartialType(CreateAnnouncementRequestDto) {
}