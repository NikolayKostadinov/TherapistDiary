export interface PagedFilteredRequest {
    pageNumber: number;
    pageSize?: number;
    searchTerm?: string | null;
    sortBy?: string | null;
    sortDescending?: boolean | null;
}
