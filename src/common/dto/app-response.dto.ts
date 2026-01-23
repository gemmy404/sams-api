import {HttpStatusText} from "../enums/http-status-text.enum";
import {ValidationError} from "class-validator";
import {PaginationDto} from "./pagination.dto";

export interface AppResponseDto<T> {
    status: HttpStatusText;
    data: T,
    message?: string,
    validationErrors?: ValidationError[];
    pagination?: PaginationDto;
}