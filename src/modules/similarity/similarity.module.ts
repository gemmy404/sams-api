import {Module} from '@nestjs/common';
import {SimilarityService} from './similarity.service';
import {SimilarityWebhookController} from './similarity-webhook.controller';
import {BullModule} from "@nestjs/bullmq";
import {HttpModule} from "@nestjs/axios";
import {SimilarityProcessor} from "./similarity.processor";
import {AssignmentSubmissionsModule} from "../assignment-submissions/assignment-submissions.module";
import {MongooseModule} from "@nestjs/mongoose";
import {SimilarityReport, SimilarityReportSchema} from "./schemas/similarity-report.schema";
import {SimilarityRepository} from "./similarity.repository";
import {SimilarityMapper} from "./similarity.mapper";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: SimilarityReport.name, schema: SimilarityReportSchema}
        ]),
        HttpModule.register({
            timeout: 30000
        }),
        BullModule.registerQueue({
            name: "plagiarism-check",
        }),
        AssignmentSubmissionsModule,
    ],
    controllers: [SimilarityWebhookController],
    providers: [SimilarityRepository, SimilarityService, SimilarityMapper, SimilarityProcessor],
    exports: [SimilarityService],
})
export class SimilarityModule {
}
