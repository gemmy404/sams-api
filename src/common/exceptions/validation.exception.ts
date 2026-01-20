import {HttpException} from "@nestjs/common";

export class ValidationException extends HttpException {
    constructor(messages: string[], status: number) {
        super(messages, status);
    }
}