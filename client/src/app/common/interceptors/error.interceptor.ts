import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToasterService } from '../../layout';
import { Utils } from '../utils';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/services';
import { LoggingService } from '../services';

/**
 * Global Error Interceptor that handles all HTTP errors centrally
 * Provides consistent error handling across the application
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const toaster = inject(ToasterService);
    const router = inject(Router);
    const authService = inject(AuthService);
    const logger = inject(LoggingService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // Log the error with detailed information
            logger.logHttpError(req.url, req.method, error.status, error);

            // Don't handle errors for specific endpoints that have their own error handling
            if (shouldSkipGlobalErrorHandling(req.url)) {
                logger.debug('Skipping global error handling for URL:', req.url);
                return throwError(() => error);
            }

            // Handle different error types
            switch (error.status) {
                case 0:
                    // Network error
                    handleNetworkError(toaster, logger);
                    break;
                case 400:
                    // Bad Request - usually validation errors
                    handleBadRequestError(error, toaster, logger);
                    break;
                case 401:
                    // Unauthorized - handled by token refresh interceptor
                    // Don't show toast for 401 as it's handled by auth flow
                    logger.debug('401 Unauthorized - handled by token refresh interceptor');
                    break;
                case 403:
                    // Forbidden
                    handleForbiddenError(toaster, router, logger);
                    break;
                case 404:
                    // Not Found
                    handleNotFoundError(error, toaster, logger);
                    break;
                case 409:
                    // Conflict
                    handleConflictError(error, toaster, logger);
                    break;
                case 422:
                    // Unprocessable Entity - validation errors
                    handleValidationError(error, toaster, logger);
                    break;
                case 500:
                case 502:
                case 503:
                case 504:
                    // Server errors
                    handleServerError(error, toaster, logger);
                    break;
                default:
                    // Unknown error
                    handleUnknownError(error, toaster, logger);
                    break;
            }

            // Always rethrow the error so components can handle it if needed
            return throwError(() => error);
        })
    );
};

/**
 * Determines if global error handling should be skipped for specific endpoints
 */
function shouldSkipGlobalErrorHandling(url: string): boolean {
    const skipPatterns = [
        '/login',
        '/register',
        '/refresh-token',
        // Add more patterns as needed
    ];

    return skipPatterns.some(pattern => url.includes(pattern));
}

/**
 * Handle network connectivity errors
 */
function handleNetworkError(toaster: ToasterService, logger: LoggingService): void {
    if (!navigator.onLine) {
        const message = 'Няма интернет връзка. Моля, проверете мрежата си и опитайте отново.';
        logger.warn('Network offline detected');
        toaster.error(message);
    } else {
        const message = 'Не може да се свърже със сървъра. Моля, опитайте отново.';
        logger.error('Network connectivity issue');
        toaster.error(message);
    }
}

/**
 * Handle 400 Bad Request errors
 */
function handleBadRequestError(error: HttpErrorResponse, toaster: ToasterService, logger: LoggingService): void {
    logger.warn('Bad Request error', error.error);

    if (error.error?.errors && Array.isArray(error.error.errors)) {
        // Multiple validation errors
        const errorMessages = error.error.errors
            .map((err: any) => err.message || err.description)
            .filter(Boolean)
            .join('; ');

        if (errorMessages) {
            toaster.error(`Невалидни данни: ${errorMessages}`);
        } else {
            toaster.error('Невалидни данни. Моля, проверете въведената информация.');
        }
    } else if (error.error?.message) {
        toaster.error(error.error.message);
    } else {
        toaster.error('Невалидни данни. Моля, проверете въведената информация.');
    }
}

/**
 * Handle 403 Forbidden errors
 */
function handleForbiddenError(toaster: ToasterService, router: Router, logger: LoggingService): void {
    logger.warn('Access forbidden - user lacks permissions');
    toaster.error('Нямате права за достъп до този ресурс.');
    // Optionally redirect to a forbidden page or home
    // router.navigate(['/forbidden']);
}

/**
 * Handle 404 Not Found errors
 */
function handleNotFoundError(error: HttpErrorResponse, toaster: ToasterService, logger: LoggingService): void {
    const context = getContextFromUrl(error.url || undefined);
    logger.warn(`Resource not found: ${error.url}`);
    toaster.error(`${context} не бяха намерени.`);
}

/**
 * Handle 409 Conflict errors
 */
function handleConflictError(error: HttpErrorResponse, toaster: ToasterService, logger: LoggingService): void {
    logger.warn('Conflict error', error.error);

    if (error.error?.message) {
        toaster.error(error.error.message);
    } else {
        toaster.error('Конфликт при обработка на заявката. Моля, опитайте отново.');
    }
}

/**
 * Handle 422 Unprocessable Entity errors (validation)
 */
function handleValidationError(error: HttpErrorResponse, toaster: ToasterService, logger: LoggingService): void {
    logger.warn('Validation error', error.error);

    if (error.error?.errors && Array.isArray(error.error.errors)) {
        const errorMessages = error.error.errors
            .map((err: any) => err.message)
            .filter(Boolean)
            .join('; ');

        if (errorMessages) {
            toaster.error(`Грешка при валидация: ${errorMessages}`);
        } else {
            toaster.error('Грешка при валидация на данните.');
        }
    } else {
        toaster.error('Грешка при валидация на данните.');
    }
}

/**
 * Handle 5xx Server errors
 */
function handleServerError(error: HttpErrorResponse, toaster: ToasterService, logger: LoggingService): void {
    logger.error('Server error occurred', error);

    switch (error.status) {
        case 500:
            toaster.error('Вътрешна грешка на сървъра. Моля, опитайте по-късно.');
            break;
        case 502:
            toaster.error('Сървърът е временно недостъпен. Моля, опитайте по-късно.');
            break;
        case 503:
            toaster.error('Услугата е временно недостъпна. Моля, опитайте по-късно.');
            break;
        case 504:
            toaster.error('Заявката отне твърде много време. Моля, опитайте отново.');
            break;
        default:
            toaster.error('Проблем със сървъра. Моля, опитайте отново по-късно.');
            break;
    }
}

/**
 * Handle unknown errors
 */
function handleUnknownError(error: HttpErrorResponse, toaster: ToasterService, logger: LoggingService): void {
    logger.error('Unknown error occurred', error);

    if (error.error?.message) {
        toaster.error(error.error.message);
    } else {
        toaster.error('Възникна неочаквана грешка. Моля, опитайте отново.');
    }
}

/**
 * Extract context from URL for better error messages
 */
function getContextFromUrl(url?: string): string {
    if (!url) return 'Данните';

    if (url.includes('/appointments')) return 'Записаните часове';
    if (url.includes('/users') || url.includes('/account')) return 'Потребителските данни';
    if (url.includes('/profile')) return 'Профилът';
    if (url.includes('/therapist')) return 'Терапевтските данни';

    return 'Данните';
}
