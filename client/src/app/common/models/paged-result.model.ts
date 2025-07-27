export interface PagedResult<T> extends PagerModel {
    items: T[],
}

export interface PagerModel {
    totalCount: number
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}