import {PaginationDto} from "../dto/pagination.dto";

export const constructPagination =
    (totalElements: number, page: number, size: number): PaginationDto => {
        const totalPages = Math.ceil(totalElements / size);
        return {
            totalElements: totalElements,
            currentPage: page,
            size: size,
            totalPages: totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        }
    }