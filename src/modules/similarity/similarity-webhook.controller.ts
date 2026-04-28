import {Body, Controller, Post, UseGuards} from '@nestjs/common';
import {SimilarityService} from './similarity.service';
import {PlagiarismEndpointResponse} from "./dto/plagiarism-endpoint.response";
import {WebhookGuard} from "./guards/webhook.guard";
import {AppResponseDto} from "../../common/dto/app-response.dto";

@Controller('api/v1/similarity')
export class SimilarityWebhookController {

    constructor(private readonly similarityService: SimilarityService) {
    }

    @Post('webhook')
    @UseGuards(WebhookGuard)
    handleSimilarityWebhook(
        @Body() webhookRequest: PlagiarismEndpointResponse
    ): Promise<AppResponseDto<null>> {
        return this.similarityService.webhookHandler(webhookRequest);
    }
}
