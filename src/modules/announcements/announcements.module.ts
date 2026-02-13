import {forwardRef, Module} from '@nestjs/common';
import {AnnouncementsService} from './announcements.service';
import {AnnouncementsController} from './announcements.controller';
import {AnnouncementsRepository} from "./announcements.repository";
import {MongooseModule} from "@nestjs/mongoose";
import {Announcement, AnnouncementSchema} from "./schemas/announcements.schema";
import {AnnouncementsMapper} from "./announcements.mapper";
import {CoursesModule} from "../courses/courses.module";
import {MaterialsModule} from "../materials/materials.module";
import {CommentsModule} from "../comments/comments.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Announcement.name, schema: AnnouncementSchema},
        ]),
        CoursesModule,
        MaterialsModule,
        forwardRef(() => CommentsModule)
    ],
    controllers: [AnnouncementsController],
    providers: [AnnouncementsRepository, AnnouncementsService, AnnouncementsMapper],
    exports: [AnnouncementsRepository, AnnouncementsService, AnnouncementsMapper],
})
export class AnnouncementsModule {
}
