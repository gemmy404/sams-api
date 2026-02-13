import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Comment} from "./schemas/comments.schema";
import {Model, QueryFilter, QueryOptions, UpdateQuery} from "mongoose";

@Injectable()
export class CommentsRepository {

    constructor(@InjectModel(Comment.name) private readonly commentsModel: Model<Comment>) {
    }

    async create(comment: Comment) {
        return this.commentsModel.create(comment);
    }

    async findAll(query: QueryFilter<Comment> = {}) {
        return this.commentsModel.find(query)
            .sort({createdAt: -1})
            .populate({path: 'author', select: {name: true, academicId: true, profilePic: true}});
    }

    async findComment(query: QueryFilter<Comment>) {
        return this.commentsModel.findOne(query);
    }

    async updateComment(
        query: QueryFilter<Comment>,
        updatedValue: UpdateQuery<Comment>,
        options: QueryOptions<Comment> = {new: true},
    ) {
        return this.commentsModel.findOneAndUpdate(query, updatedValue, options)
            .populate({path: 'author', select: {name: true, academicId: true, profilePic: true}});
    }

    async deleteComment(query: QueryFilter<Comment>) {
        return this.commentsModel.findOneAndDelete(query);
    }
}
