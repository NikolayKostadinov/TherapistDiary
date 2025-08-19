import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Utils } from '../../../common/utils';
import { HEADER_KEYS } from '../../../common';

export const tokenRefreshInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (shouldHandleAuthError(error, req.url)) {
                return handleAuthenticationError(req, next, authService);
            }
            return throwError(() => error);
        })
    );
};

function shouldHandleAuthError(error: HttpErrorResponse, url: string): boolean {
    return error.status === 401 && !Utils.isPublicUrl(url);
}

function handleAuthenticationError(
    req: HttpRequest<unknown>,
    next: HttpHandlerFn,
    authService: AuthService
): Observable<HttpEvent<unknown>> {

    return authService.refreshToken().pipe(
        switchMap((success) => {
            if (success && authService.isAuthenticated()) {
                return retryRequestWithNewToken(req, next, authService);
            } else {
                authService.logout();
                return throwError(() => new Error('Неуспешна автентикация. Моля влезте отново!'));
            }
        })
    );
}


function retryRequestWithNewToken(
    req: HttpRequest<unknown>,
    next: HttpHandlerFn,
    authService: AuthService
): Observable<HttpEvent<unknown>> {
    const accessToken = authService.accessToken();

    if (accessToken) {
        const authReq = req.clone({
            setHeaders: {
                Authorization: `${HEADER_KEYS.BEARER_KEY} ${accessToken}`
            }
        });
        return next(authReq);
    }

    // No valid token available
    authService.logout();
    return throwError(() => new Error('Няма наличен валиден токен за достъп'));
}


