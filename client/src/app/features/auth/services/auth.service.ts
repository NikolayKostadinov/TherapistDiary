import { Injectable, signal, computed, effect } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { AuthHttpService } from '.';
import { HEADER_KEYS, TOKEN_KEYS } from '../../../common/constants';
import { JwtPayload, LoginRequest, UserInfo } from '../models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // Private signals for internal state
    private _accessToken = signal<string | null>(null);
    private _refreshToken = signal<string | null>(null);
    private _currentUser = signal<UserInfo | null>(null);

    // Public readonly signals
    readonly isLoggedIn = computed(() =>
        !!this._accessToken() && !!this._currentUser()
    );

    readonly currentUser = computed(() =>
        this._currentUser()
    );

    readonly accessToken = computed(() =>
        this._accessToken()
    );

    constructor(private readonly authHttpService: AuthHttpService) {
        this.initializeFromStorage();
        this.setupTokenSync();
    }

    private initializeFromStorage(): void {
        const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
        const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);

        this._accessToken.set(accessToken);
        this._refreshToken.set(refreshToken);

        if (accessToken) {
            this.updateUserFromToken(accessToken);
        }
    }

    private setupTokenSync(): void {
        // Auto-sync tokens with localStorage
        effect(() => {
            const accessToken = this._accessToken();
            if (accessToken) {
                localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
            } else {
                localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
            }
        });

        effect(() => {
            const refreshToken = this._refreshToken();
            if (refreshToken) {
                localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
            } else {
                localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
            }
        });
    }

    private updateUserFromToken(token: string): void {
        try {
            const payload = jwtDecode<JwtPayload>(token);
            const currentTime = Math.floor(Date.now() / 1000);
            const isExpired = payload.exp < currentTime;

            if (!isExpired) {
                const userInfo: UserInfo = {
                    id: payload.sub,
                    email: payload.email,
                    username: payload.username,
                    fullName: payload.fullName,
                    profilePictureUrl: payload.profilePictureUrl,
                    roles: this.extractRoles(payload),
                    isExpired
                };

                this._currentUser.set(userInfo);
            } else {
                this.logout();
            }
        } catch (error) {
            console.error('Грешка при декодирането на JWT токен:', error);
            this.logout();
        }
    }

    private extractRoles(payload: JwtPayload): string[] {
        if (payload.roles && Array.isArray(payload.roles)) {
            return payload.roles;
        }
        return [];
    }

    login(loginData: LoginRequest): Observable<void> {
        return this.authHttpService.login(loginData).pipe(
            tap((httpResponse) => {
                // Extract tokens from headers
                const accessToken = httpResponse.headers.get(HEADER_KEYS.AUTH_HEADER_KEY)?.replace(HEADER_KEYS.BEARER_KEY, '')
                    || httpResponse.headers.get(TOKEN_KEYS.ACCESS_TOKEN);
                const refreshToken = httpResponse.headers.get(TOKEN_KEYS.REFRESH_TOKEN);

                if (accessToken) {
                    this._accessToken.set(accessToken);
                    this.updateUserFromToken(accessToken);
                }

                if (refreshToken) {
                    this._refreshToken.set(refreshToken);
                }
            }),
            map(() => void 0), // Return void
            catchError((error) => {
                return throwError(() => error);
            })
        );
    }

    logout(): void {
        // Clear all signals
        this._accessToken.set(null);
        this._refreshToken.set(null);
        this._currentUser.set(null);
    }

    /**
     * Initialize authentication state from stored tokens
     * Called during application startup
     */
    initializeAuth(): void {
        console.log('🔐 Initializing auth state from localStorage...');
        this.initializeFromStorage();
    }

    refreshToken(): Observable<boolean> {
        const refreshToken = this._refreshToken();
        console.log('AuthService.refreshToken called. RefreshToken available:', !!refreshToken);

        if (!refreshToken) {
            console.log('No refresh token available');
            return throwError(() => new Error('Няма наличен токен за обновяване'));
        }

        console.log('Calling authHttpService.refreshToken...');
        return this.authHttpService.refreshToken(refreshToken).pipe(
            tap((httpResponse) => {
                console.log('Refresh token response received:', httpResponse.status);
                console.log('Response headers:', httpResponse.headers.keys());

                // Extract tokens from headers
                const accessToken = httpResponse.headers.get(HEADER_KEYS.AUTH_HEADER_KEY)?.replace(HEADER_KEYS.BEARER_KEY, '') ||
                    httpResponse.headers.get('X-Access-Token') ||
                    httpResponse.headers.get('x-access-token');

                const newRefreshToken = httpResponse.headers.get(TOKEN_KEYS.REFRESH_TOKEN) ||
                    httpResponse.headers.get('x-refresh-token');

                console.log('Extracted access token:', !!accessToken);
                console.log('Extracted refresh token:', !!newRefreshToken);

                if (accessToken) {
                    this._accessToken.set(accessToken);
                    this.updateUserFromToken(accessToken);
                    console.log('Access token updated successfully');
                }

                if (newRefreshToken) {
                    this._refreshToken.set(newRefreshToken);
                    console.log('Refresh token updated successfully');
                }
            }),
            map(() => {
                console.log('Token refresh completed successfully');
                return true;
            }),
            catchError((error) => {
                console.log('Token refresh failed:', error);
                this.logout();
                return throwError(() => new Error('Сесията изтече. Моля, влезте отново.'));
            })
        );
    }
}
