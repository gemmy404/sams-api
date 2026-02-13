import {forwardRef, Module} from '@nestjs/common';
import {CommentsService} from './comments.service';
import {CommentsController} from './comments.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Comment, CommentSchema} from "./schemas/comments.schema";
import {CommentsRepository} from "./comments.repository";
import {CommentsMapper} from "./comments.mapper";
import {AnnouncementsModule} from "../announcements/announcements.module";
import {MaterialsModule} from "../materials/materials.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Comment.name, schema: CommentSchema},
        ]),
        forwardRef(() => AnnouncementsModule),
        MaterialsModule,
    ],
    controllers: [CommentsController],
    providers: [CommentsRepository, CommentsService, CommentsMapper],
    exports: [CommentsRepository, CommentsService],
})
export class CommentsModule {
}
