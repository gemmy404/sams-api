import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Enrollment} from "./schemas/enrollments.schema";
import {Model, QueryFilter} from "mongoose";
import {Course} from "../courses/schemas/courses.schema";
import {Users} from "../users/schemas/users.schema";

@Injectable()
export class EnrollmentsRepository {

    constructor(
        @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<Enrollment>,
    ) {
    }

    async create(joinCourse: any) {
        return this.enrollmentModel.create(joinCourse);
    }

    async findByUserIdAndCourseId(userId: string, courseId: string) {
        return this.enrollmentModel.findOne({
            user: userId,
            course: courseId
        });
    }

    async findAll(query: QueryFilter<Course>, sortBy: string) {
        return this.enrollmentModel.find(query)
            .sort({[sortBy]: -1})
            .populate({
                path: 'course',
                select: 'name instructor academicCourseCode',
                populate: {
                    path: 'instructor',
                    model: Users.name,
                    select: 'name'
                },
            }).exec();
    }

    async deleteByUserIdAndCourseId(userId: string, courseId: string) {
        return this.enrollmentModel.deleteOne({
            user: userId,
            course: courseId
        });
    }
}
