export class PaginationDto {
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}