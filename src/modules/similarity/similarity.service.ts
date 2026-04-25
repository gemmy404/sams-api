import {Injectable} from '@nestjs/common';
import {InjectQueue} from "@nestjs/bullmq";
import {Queue} from "bullmq";
import {PlagiarismEndpointResponse} from "./dto/plagiarism-endpoint.response";
import {SimilarityRepository} from "./similarity.repository";
import {SimilarityStatus} from "./enums/similarity-status.enum";
import {SimilarityResult} from "./schemas/similarity-result.schema";
import {HttpStatusText} from "../../common/enums/http-status-text.enum";
import {Types} from "mongoose";
import {AssignmentSubmissionsRepository} from "../assignment-submissions/assignment-submissions.repository";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {SimilarityMapper} from "./similarity.mapper";
import {AssignmentSubmissionsService} from "../assignment-submissions/assignment-submissions.service";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class SimilarityService {

    constructor(
        @InjectQueue('plagiarism-check') private plagiarismQueue: Queue,
        private readonly similarityRepository: SimilarityRepository,
        private readonly assignmentSubmissionsRepository: AssignmentSubmissionsRepository,
        private readonly assignmentSubmissionsService: AssignmentSubmissionsService,
        private readonly similarityMapper: SimilarityMapper,
        private readonly configService: ConfigService,
    ) {
    }

    async schedulePlagiarismCheck(assignmentId: string, dueDate: Date, enablePlagiarismCheck: boolean) {
        const delayAfterDueDateInMin: number = Number(
            this.configService
                .get('PLAGIARISM_CHECK_DELAY_AFTER_DUE_DATE') as string
        );
        const delay = dueDate.getTime() - Date.now() + (delayAfterDueDateInMin * 60 * 1000);

        await this.plagiarismQueue.add(
            'analyze-similarity',
            {assignmentId, enablePlagiarismCheck},
            {
                delay: delay > 0 ? delay : 0,
                attempts: 3,
                jobId: assignmentId,
                backoff: 5000,
                removeOnComplete: true,
            }
        );

    }

    async webhookHandler(webhookRequest: PlagiarismEndpointResponse): Promise<AppResponseDto<null>> {
        const updatedValue: { status?: SimilarityStatus, errorLog?: string, results?: SimilarityResult[] } = {};

        if (webhookRequest.hasError && webhookRequest.errorMessage) {
            updatedValue.status = SimilarityStatus.FAILED;
            updatedValue.errorLog = webhookRequest.errorMessage;
        } else if (!webhookRequest.hasError && webhookRequest.results) {
            updatedValue.status = SimilarityStatus.COMPLETED;
            updatedValue.errorLog = "";
            updatedValue.results = webhookRequest.results?.map(res => ({
                student: new Types.ObjectId(res.studentId),
                submission: new Types.ObjectId(res.submissionId),
                matches: res.matches,
            }));
        }

        if (Object.keys(updatedValue).length > 0) {
            await this.similarityRepository.updateSimilarityReport({
                    assignment: new Types.ObjectId(webhookRequest.assignmentId)
                },
                updatedValue,
            );

            if (updatedValue.status === SimilarityStatus.COMPLETED) {
                await this.assignmentSubmissionsService.processPlagiarismResults(
                    new Types.ObjectId(webhookRequest.assignmentId),
                    updatedValue.results!,
                );
            }
        }

        const appResponse: AppResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            message: 'Similarity report updated successfully',
            data: null,
        }

        return appResponse;
    }

}
