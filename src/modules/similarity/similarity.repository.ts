import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {SimilarityReport} from "./schemas/similarity-report.schema";
import {Model, PopulateOptions, QueryFilter, Types, UpdateQuery} from "mongoose";
import {SimilarityStatus} from "./enums/similarity-status.enum";

@Injectable()
export class SimilarityRepository {

    constructor(
        @InjectModel(SimilarityReport.name) private readonly similarityReportModel: Model<SimilarityReport>,
    ) {
    }

    async createSimilarityReport(report: SimilarityReport) {
        return this.similarityReportModel.create(report);
    }

    async findOne(query: QueryFilter<SimilarityReport>) {
        return this.similarityReportModel.findOne(query);
    }

    async findStudentReport(assignmentId: Types.ObjectId, submissionId: Types.ObjectId) {
        const populated: PopulateOptions[] = [
            {
                path: 'results.student',
                select: 'name'
            },
            {
                path: 'results.matches.comparedWithStudent',
                select: 'name'
            },
            {
                path: 'results.matches.comparedWithSubmission',
                select: 'submittedItems.contentReference'
            },
            {
                path: 'assignment',
                select: 'plagiarismThreshold'
            }
        ];

        return this.similarityReportModel.findOne({
                assignment: assignmentId,
                'results.submission': submissionId,
                status: SimilarityStatus.COMPLETED,
            },
            {
                results: {
                    $elemMatch: {submission: submissionId}
                }
            })
            .populate(populated)
            .sort({"results.matches.similarityPercentage": -1, "results.submission": -1});
    }

    async updateSimilarityReport(
        query: QueryFilter<SimilarityReport>,
        updatedValue: UpdateQuery<SimilarityReport>
    ) {
        return this.similarityReportModel.findOneAndUpdate(query, updatedValue, {new: true});
    }
}