import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject, signal } from '@angular/core';
import { catchError, switchMap, filter, take, finalize } from 'rxjs/operators';
import { throwError, Subject, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { HEADER_KEYS } from '../../../common/constants';
import { Utils } from '../../../common/utils';

// Shared state for refresh process
const isRefreshing = signal<boolean>(false);
const refreshTokenSubject = new Subject<boolean | null>();

export const tokenRefreshInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            console.log('Interceptor caught error:', error.status, 'for URL:', req.url);

            // Only handle 401 errors for private endpoints (not login/refresh endpoints)
            if (error.status === 401 && !Utils.isPublicUrl(req.url)) {
                console.log('Handling 401 error for private URL:', req.url);
                return handle401Error(req, next, authService);
            }

            return throwError(() => error);
        })
    );
};

function handle401Error(request: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService): Observable<HttpEvent<unknown>> {
    console.log('Handle401Error called. isRefreshing:', isRefreshing());

    if (!isRefreshing()) {
        console.log('Starting token refresh process...');
        isRefreshing.set(true);
        refreshTokenSubject.next(null); // Reset subject

        return authService.refreshToken().pipe(
            switchMap((success: boolean) => {
                console.log('Token refresh result:', success);
                isRefreshing.set(false);
                refreshTokenSubject.next(success);

                // Retry the original request with new token
                const newToken = authService.accessToken();
                console.log('New token available:', !!newToken);

                if (newToken && success) {
                    const authHeaderValue = Utils.getAuthorizationHeader(newToken);
                    console.log('Retrying request with new token for:', request.url);
                    const authRequest = request.clone({
                        setHeaders: {
                            Authorization: authHeaderValue
                        }
                    });
                    return next(authRequest);
                }

                console.log('Token refresh succeeded but no valid token available');
                return throwError(() => new Error('Неуспешно обновяване на токена'));
            }),
            catchError((err) => {
                console.log('Token refresh failed:', err);
                isRefreshing.set(false);
                refreshTokenSubject.next(false);
                // Refresh failed, logout user
                authService.logout();
                return throwError(() => err);
            }),
            finalize(() => {
                console.log('Token refresh process finalized');
            })
        );
    } else {
        console.log('Token refresh already in progress, waiting...');
        // If refresh is already in progress, wait for it to complete
        return refreshTokenSubject.pipe(
            filter(result => result !== null && result !== undefined),
            take(1),
            switchMap((success: boolean) => {
                console.log('Received refresh result from queue:', success);

                if (success) {
                    const newToken = authService.accessToken();
                    if (newToken) {
                        const authHeaderValue = Utils.getAuthorizationHeader(newToken);
                        console.log('Retrying queued request with new token for:', request.url);
                        const authRequest = request.clone({
                            setHeaders: {
                                Authorization: authHeaderValue
                            }
                        });
                        return next(authRequest);
                    }
                }

                console.log('Queued request failed - no valid token');
                return throwError(() => new Error('Неуспешно обновяване на токена'));
            })
        );
    }
}


