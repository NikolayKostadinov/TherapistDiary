export interface ValidationError {
    field: string;
    message: string;
    location?: string;
}

export interface ApiErrorResponse {
    errors: ValidationError[];
    title?: string;
    status?: number;
    detail?: string;
}

export interface ApiError {
    error?: ApiErrorResponse;
    errors?: ValidationError[];
    message?: string;
}
