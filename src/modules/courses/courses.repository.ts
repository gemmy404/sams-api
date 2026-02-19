import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Course} from "./schemas/courses.schema";
import {Model, QueryFilter, QueryOptions, UpdateQuery} from "mongoose";

@Injectable()
export class CoursesRepository {

    constructor(
        @InjectModel(Course.name) private readonly coursesModel: Model<Course>,
    ) {
    }

    async create(createCourseRequest: any) {
        return this.coursesModel.create(createCourseRequest);
    }

    async findCourse(query: QueryFilter<Course>, select: Record<string, boolean> = {}) {
        return this.coursesModel.findOne(query, select);
    }

    async findAll(query: QueryFilter<Course>, sortBy: string) {
        return this.coursesModel.find(query)
            .sort({[sortBy]: -1})
            .populate({path: 'instructor', select: {name: true}});
    }

    async findCourseOwner(query: QueryFilter<Course>) {
        return this.coursesModel.findOne(query)
            .populate('instructor');
    }

    async updateCourse(
        query: QueryFilter<Course>,
        updatedValue: UpdateQuery<Course>,
        options: QueryOptions<Course> = {new: true}
    ) {
        return this.coursesModel.findOneAndUpdate(query, updatedValue, options);
    }

    async deleteCourse(query: QueryFilter<Course>) {
        return this.coursesModel.findOneAndDelete(query);
    }

    async findAllClasswork(query: QueryFilter<Course>) {
        return this.coursesModel.findOne(query, {classwork: true});
    }

}
