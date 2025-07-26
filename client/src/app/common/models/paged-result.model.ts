export interface PagedResult<T> {
    items: T[],
    TotalCount: number
    Page: number;
    PageSize: number;
    TotalPages: number;
    HasNextPage: boolean;
    HasPreviousPage: boolean;
}