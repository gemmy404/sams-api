import {Module} from '@nestjs/common';
import {MeetingService} from './meeting.service';
import {MeetingController} from './meeting.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Meeting, MeetingSchema} from "./schemas/meeting.schema";
import {MeetingRepository} from "./meeting.repository";
import {MeetingMapper} from "./meeting.mapper";
import {CoursesModule} from "../courses/courses.module";
import {UsersModule} from "../users/users.module";
import {BullModule} from "@nestjs/bullmq";
import {MeetingProcessor} from "./meeting.processor";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Meeting.name, schema: MeetingSchema}
        ]),
        BullModule.registerQueue({
            name: "meeting",
        }),
        CoursesModule,
        UsersModule,
    ],
    controllers: [MeetingController],
    providers: [MeetingRepository, MeetingService, MeetingMapper, MeetingProcessor,],
    exports: [MeetingService],
})
export class MeetingModule {
}
