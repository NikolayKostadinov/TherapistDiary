import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LoginRequest, UserInfo } from '../models';
import { TokenService } from './token.service';
import { UserStateService } from './user-state.service';
import { AuthHttpService } from './auth-http.service';
import { TokenStorageService } from './token-storage.service';
import { TOKEN_KEYS } from '../constants/token-keys';

/**
 * Main authentication service that coordinates between other services
 */
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(
        private readonly tokenService: TokenService,
        private readonly userStateService: UserStateService,
        private readonly authHttpService: AuthHttpService,
        private readonly tokenStorageService: TokenStorageService
    ) {
        this.initializeAuthState();
    }

    private initializeAuthState(): void {
        console.log('Initializing auth state...');

        const userInfo = this.tokenService.isTokenValid()
            ? this.tokenService.userInfo
            : null;

        if (userInfo) {
            this.userStateService.setAuthenticated(userInfo);
            return;
        }

        if (this.tokenService.refreshToken) {
            this.attemptTokenRefresh();
            return;
        }

        this.userStateService.setUnauthenticated();
    }


    private attemptTokenRefresh(): void {
        this.refreshToken().subscribe({
            next: (success) => {
                if (success) {
                    console.log('Token refreshed successfully on app start');
                }
            },
            error: (error) => {
                console.log('Failed to refresh token on app start:', error);
                this.logout();
            }
        });
    }


    login(loginData: LoginRequest): Observable<void> {
        console.log('Starting login request...');
        return this.authHttpService.login(loginData).pipe(
            map((response) => {
                this.tokenStorageService.storeTokensFromResponse(response);
                const userInfo = this.tokenService.userInfo;
                if (!userInfo) {
                    throw new Error('Failed to decode user information from token');
                }

                this.userStateService.setAuthenticated(userInfo);
                console.log('Login completed successfully');
            }),
            catchError((error) => {
                console.error('Login failed:', error);
                return throwError(() => error);
            })
        );
    }

    logout(): void {
        this.tokenService.clearTokens();
        this.userStateService.setUnauthenticated();
    }

    refreshToken(): Observable<boolean> {
        const refreshToken = this.tokenService.refreshToken;

        if (!refreshToken) {
            return throwError(() => new Error('No refresh token available'));
        }

        return this.authHttpService.refreshToken(refreshToken).pipe(
            map((response) => {
                this.tokenStorageService.storeTokensFromResponse(response);
                this.userStateService.updateUserFromToken();
                return true;
            }),
            catchError((error) => {
                console.error('Token refresh failed:', error);
                this.logout();
                return throwError(() => new Error('Session expired. Please login again.'));
            })
        );
    }
}
