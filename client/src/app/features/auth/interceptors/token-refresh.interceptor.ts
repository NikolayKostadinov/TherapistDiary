import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject, signal } from '@angular/core';
import { catchError, switchMap, filter, take, finalize } from 'rxjs/operators';
import { throwError, Subject, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { HEADER_KEYS } from '../../../common/constants';
import { Utils } from '../../../common/utils';

const isRefreshing = signal<boolean>(false);
const refreshTokenSubject = new Subject<boolean | null>();

export const tokenRefreshInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // Only handle 401 errors for private endpoints (not login/refresh endpoints)
            if (error.status === 401 && !Utils.isPublicUrl(req.url)) {
                return handle401Error(req, next, authService);
            }

            return throwError(() => error);
        })
    );
};

function handle401Error(request: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService): Observable<HttpEvent<unknown>> {
    if (!isRefreshing()) {
        isRefreshing.set(true);
        refreshTokenSubject.next(null); // Reset subject

        return authService.refreshToken().pipe(
            switchMap((success: boolean) => {
                isRefreshing.set(false);
                refreshTokenSubject.next(success);

                // Retry the original request with new token
                const newToken = authService.accessToken();

                if (newToken && success) {
                    const authHeaderValue = Utils.getAuthorizationHeader(newToken);
                    const authRequest = request.clone({
                        setHeaders: {
                            Authorization: authHeaderValue
                        }
                    });
                    return next(authRequest);
                }

                return throwError(() => new Error('Неуспешно обновяване на токена'));
            }),
            catchError((err) => {
                isRefreshing.set(false);
                refreshTokenSubject.next(false);
                
                // Only logout if this is actually an authentication error
                // Don't logout for general server errors or network issues
                if (err?.status === 401 || err?.status === 403 || 
                    (err?.message && err.message.includes('token')) ||
                    (err?.error && typeof err.error === 'string' && err.error.includes('token'))) {
                    console.log('🚪 Authentication error detected, logging out:', err.status, err.message);
                    authService.logout();
                } else {
                    console.log('⚠️ Server error during refresh, but not logging out:', err.status, err.message);
                }
                
                return throwError(() => err);
            })
        );
    } else {
        // If refresh is already in progress, wait for it to complete
        return refreshTokenSubject.pipe(
            filter(result => result !== null && result !== undefined),
            take(1),
            switchMap((success: boolean) => {
                if (success) {
                    const newToken = authService.accessToken();
                    if (newToken) {
                        const authHeaderValue = Utils.getAuthorizationHeader(newToken);
                        const authRequest = request.clone({
                            setHeaders: {
                                Authorization: authHeaderValue
                            }
                        });
                        return next(authRequest);
                    }
                }

                return throwError(() => new Error('Неуспешно обновяване на токена'));
            })
        );
    }
}


