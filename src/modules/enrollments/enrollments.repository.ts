import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Enrollment} from "./schemas/enrollments.schema";
import {Model, QueryFilter, Types} from "mongoose";
import {Users} from "../users/schemas/users.schema";
import {GradeRowResponseDto} from "../grades/dto/grade-row-response.dto";

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

    async findAll(query: QueryFilter<Enrollment>, sortBy: string) {
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

    async deleteMany(query: QueryFilter<Enrollment>) {
        return this.enrollmentModel.deleteMany(query);
    }

    async findAllGradesWithAggregation(
        courseId: Types.ObjectId,
        sortBy: string,
        sortOrder: 'asc' | 'desc',
        size: number,
        skip: number,
        locale: string = 'ar',
        search?: string
    ) {
        const searchStage = search ? {
            $match: {
                $or: [
                    {'studentData.name': {$regex: search, $options: 'i'}},
                    {'studentData.academicId': {$regex: search, $options: 'i'}}
                ]
            }
        } : null;
        const order = sortOrder === 'asc' ? 1 : -1;

        const pipeline: any[] = [
            {$match: {course: courseId}},

            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'studentData'
                }
            },
            {$unwind: '$studentData'},

            ...(searchStage ? [searchStage] : []),

            {
                $lookup: {
                    from: 'grades',
                    let: {studentId: '$user'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {$eq: ['$student', '$$studentId']},
                                        {$eq: ['$course', courseId]}
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'allGrades'
                }
            },

            {
                $addFields: {
                    gradesMap: {
                        $arrayToObject: {
                            $map: {
                                input: '$allGrades',
                                as: 'g',
                                in: {
                                    k: {$toString: '$$g.classworkId'},
                                    v: '$$g.score'
                                }
                            }
                        }
                    }
                }
            }
        ];

        let sortStage = {};

        if (sortBy === 'name') {
            sortStage = {'studentData.name': order, 'studentData.academicId': 1};
        } else if (sortBy === 'academicId') {
            sortStage = {'studentData.academicId': order, 'studentData.name': 1};
        } else {
            sortStage = {[`gradesMap.${sortBy}`]: order, 'studentData.name': 1};
        }
        pipeline.push({$sort: sortStage});

        pipeline.push({
            $facet: {
                metadata: [{$count: "total"}],
                data: [
                    {$skip: skip},
                    {$limit: size},
                    {
                        $project: {
                            _id: 0,
                            student: {
                                academicId: '$studentData.academicId',
                                name: '$studentData.name'
                            },
                            grades: '$gradesMap'
                        }
                    }
                ]
            }
        });

        const result = await this.enrollmentModel.aggregate(pipeline)
            .collation({locale: locale === 'ar' ? 'ar' : 'en', strength: 2})
            .exec();

        const grades = result[0]?.data as GradeRowResponseDto[];

        const totalElements = result[0]?.metadata[0]?.total as number || 0;

        return {grades, totalElements};
    }
}
