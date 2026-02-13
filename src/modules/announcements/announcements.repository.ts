import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Announcement} from "./schemas/announcements.schema";
import {Model, QueryFilter, QueryOptions, UpdateQuery} from "mongoose";

@Injectable()
export class AnnouncementsRepository {

    constructor(@InjectModel(Announcement.name) private readonly announcementsModel: Model<Announcement>) {
    }

    async create(announcement: Announcement) {
        return this.announcementsModel.create(announcement);
    }

    async findAll(query: QueryFilter<Announcement> = {}) {
        return this.announcementsModel.find(query)
            .sort({createdAt: -1});
    }

    async findAnnouncement(query: QueryFilter<Announcement>) {
        return this.announcementsModel.findOne(query);
    }

    async updateAnnouncement(
        query: QueryFilter<Announcement>,
        updatedValue: UpdateQuery<Announcement>,
        options: QueryOptions<Announcement> = {new: true},
    ) {
        return this.announcementsModel.findOneAndUpdate(query, updatedValue, options)
    }

    async deleteAnnouncement(query: QueryFilter<Announcement>) {
        return this.announcementsModel.findOneAndDelete(query);
    }
}
