import {Processor, WorkerHost} from "@nestjs/bullmq";
import {Job} from "bullmq";
import {Types} from "mongoose";
import {AssignmentSubmissionsService} from "../assignment-submissions/assignment-submissions.service";
import {HttpService} from "@nestjs/axios";
import {SimilarityRepository} from "./similarity.repository";
import {SimilarityStatus} from "./enums/similarity-status.enum";
import {lastValueFrom} from "rxjs";
import {SimilarityReport} from "./schemas/similarity-report.schema";
import {ConfigService} from "@nestjs/config";

@Processor('plagiarism-check')
export class SimilarityProcessor extends WorkerHost {
    constructor(
        private readonly assignmentSubmissionsService: AssignmentSubmissionsService,
        private readonly similarityRepository: SimilarityRepository,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        super();
    }

    async process(job: Job, token?: string): Promise<any> {
        const assignmentId = new Types.ObjectId(job.data.assignmentId as Types.ObjectId);
        const enablePlagiarismCheck = job.data.enablePlagiarismCheck as boolean;

        if (!enablePlagiarismCheck) {
            await this.assignmentSubmissionsService.approveAllSubmissions(assignmentId);
            return;
        }

        const payload = await this.assignmentSubmissionsService
            .prepareAIPayload(assignmentId);

        if (payload.submissions.length < 2)
            return;

        const query: SimilarityReport = {
            assignment: assignmentId,
            status: SimilarityStatus.PENDING,
            results: [],
        };
        try {
            const url: string = this.configService.get('PLAGIARISM_CHECK_URL') as string;
            await lastValueFrom(
                this.httpService.post(url, payload)
            );

        } catch (error) {
            query.status = SimilarityStatus.FAILED;
            query.errorLog = error.message as string;
        }

        const savedReport = await this.similarityRepository.findOne({
            assignment: assignmentId
        });
        if (!savedReport) {
            await this.similarityRepository.createSimilarityReport(query);
        }

    }

}