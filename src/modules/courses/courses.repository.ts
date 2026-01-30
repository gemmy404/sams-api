import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Course} from "./schemas/courses.schema";
import {Model, QueryFilter} from "mongoose";

@Injectable()
export class CoursesRepository {

    constructor(
        @InjectModel(Course.name) private readonly coursesModel: Model<Course>,
    ) {
    }

    async create(createCourseRequest: any) {
        return this.coursesModel.create(createCourseRequest);
    }

    async findCourse(query: QueryFilter<Course>) {
        return this.coursesModel.findOne(query);
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


}
