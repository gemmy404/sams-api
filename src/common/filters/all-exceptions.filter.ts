import {ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger} from "@nestjs/common";
import {Response} from "express";
import {HttpStatusText} from "../enums/http-status-text.enum";
import {AppResponseDto} from "../dto/app-response.dto";
import {ValidationException} from "../exceptions/validation.exception";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger: Logger = new Logger(AllExceptionsFilter.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const appResponse: AppResponseDto<undefined | null> = {
            status: HttpStatusText.FAIL,
            data: undefined,
        };

        if (exception instanceof ValidationException) {
            const messages = exception.getResponse();

            if (typeof messages === 'object' && Array.isArray(messages)) {
                appResponse.validationErrors = messages;

                return response.status(exception.getStatus()).json(appResponse);
            }
        }

        if (exception instanceof HttpException) {
            appResponse.status =
                exception.getStatus() < 500
                    ? HttpStatusText.FAIL
                    : HttpStatusText.ERROR;
            appResponse.message = exception.message || 'Something went wrong. Please try again later';
            appResponse.data = null;

            return response.status(exception.getStatus()).json(appResponse);
        }

        appResponse.status = HttpStatusText.ERROR;
        appResponse.message = exception.message || 'Internal server error';

        if (exception.name === 'MongoServerSelectionError') {
            this.logger.error('[DATABASE]', exception.message);
        }

        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(appResponse);
    }

}