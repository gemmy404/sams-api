import {Injectable} from '@nestjs/common';
import {InjectQueue} from "@nestjs/bullmq";
import {Queue} from "bullmq";
import {SimilarityRepository} from "./similarity.repository";
import {AssignmentSubmissionsRepository} from "../assignment-submissions/assignment-submissions.repository";
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

}
