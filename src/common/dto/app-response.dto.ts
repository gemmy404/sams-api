import {HttpStatusText} from "../enums/http-status-text.enum";
import {ValidationError} from "class-validator";

export interface AppResponseDto<T> {
    status: HttpStatusText;
    data: T,
    message?: string,
    validationErrors?: ValidationError[];
}