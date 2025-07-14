import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services';

@Injectable()
export class TokenRefreshInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(
        private readonly authService: AuthService,
        private readonly tokenService: TokenService
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                // Only handle 401 errors and don't refresh for login/refresh endpoints
                if (error.status === 401 && !this.isAuthEndpoint(request.url)) {
                    return this.handle401Error(request, next);
                }

                return throwError(() => error);
            })
        );
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.authService.refreshToken().pipe(
                switchMap((success: boolean) => {
                    this.isRefreshing = false;
                    this.refreshTokenSubject.next(success);

                    // Retry the original request with new token
                    const newToken = this.tokenService.accessToken;
                    if (newToken) {
                        const authRequest = request.clone({
                            setHeaders: {
                                Authorization: `Bearer ${newToken}`
                            }
                        });
                        return next.handle(authRequest);
                    }

                    return throwError(() => new Error('Token refresh failed'));
                }),
                catchError((err) => {
                    this.isRefreshing = false;
                    // Refresh failed, logout user
                    this.authService.logout();
                    return throwError(() => err);
                })
            );
        } else {
            // If refresh is already in progress, wait for it to complete
            return this.refreshTokenSubject.pipe(
                filter(result => result !== null),
                take(1),
                switchMap(() => {
                    const newToken = this.tokenService.accessToken;
                    if (newToken) {
                        const authRequest = request.clone({
                            setHeaders: {
                                Authorization: `Bearer ${newToken}`
                            }
                        });
                        return next.handle(authRequest);
                    }

                    return throwError(() => new Error('Token refresh failed'));
                })
            );
        }
    }

    private isAuthEndpoint(url: string): boolean {
        return url.includes('/login') || url.includes('/register') || url.includes('/refresh');
    }
}
