import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {Request} from "express";

@Injectable()
export class WebhookGuard implements CanActivate {
    constructor(private configService: ConfigService) {
    }

    canActivate(context: ExecutionContext): boolean {
        const request: Request = context.switchToHttp().getRequest();
        const clientSecret = request.headers['x-plagiarism-webhook-secret'];
        const serverSecret: string | undefined = this.configService.get('PLAGIARISM_WEBHOOK_SECRET');

        if (!clientSecret || clientSecret !== serverSecret) {
            throw new UnauthorizedException('Invalid Webhook Secret');
        }
        return true;
    }
}