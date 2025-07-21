import { Injectable, signal, computed, effect } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { AuthHttpService } from '.';
import { HEADER_KEYS, TOKEN_KEYS } from '../../../common/constants';
import { JwtPayload, LoginRequest, RegisterRequest, UserInfo } from '../models';

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

    // Check if token is valid (not expired)
    readonly isTokenValid = computed(() => {
        const token = this._accessToken();
        if (!token) return false;

        try {
            const payload = jwtDecode<JwtPayload>(token);
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp > currentTime;
        } catch {
            return false;
        }
    });

    // Check if user is authenticated with valid token
    readonly isAuthenticated = computed(() =>
        this.isLoggedIn() && this.isTokenValid()
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

        if (accessToken && refreshToken) {
            // Check if access token is expired
            try {
                const payload = jwtDecode<JwtPayload>(accessToken);
                const currentTime = Math.floor(Date.now() / 1000);
                const isExpired = payload.exp < currentTime;

                if (isExpired) {
                    // Don't logout immediately, try to refresh first
                    this.refreshToken().subscribe({
                        next: (success) => {
                            // Token refreshed successfully during initialization
                        },
                        error: (error) => {
                            this.logout();
                        }
                    });
                } else {
                    // Token is valid, update user info
                    this.updateUserFromToken(accessToken);
                }
            } catch (error) {
                // Try to refresh if we have refresh token, otherwise logout
                if (refreshToken) {
                    this.refreshToken().subscribe({
                        error: () => this.logout()
                    });
                } else {
                    this.logout();
                }
            }
        } else if (accessToken && !refreshToken) {
            // Only access token, check if valid
            this.updateUserFromToken(accessToken);
        }
        // If no tokens, user stays logged out (default state)
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
                // Token is expired, but don't logout here
                // Let the caller decide what to do (refresh or logout)
                this._currentUser.set(null);
            }
        } catch (error) {
            this._currentUser.set(null);
            // Don't auto-logout here, let caller handle it
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

    register(registerData: RegisterRequest): Observable<void> {
        return this.authHttpService.register(registerData).pipe(
            tap((httpResponse) => {
                // Extract tokens from headers after successful registration
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
        this.initializeFromStorage();
    }

    /**
     * Ensure we have a valid access token, refresh if needed
     * Returns observable that resolves to true if we have valid token, false otherwise
     */
    ensureValidToken(): Observable<boolean> {
        // If token is valid, return true immediately
        if (this.isTokenValid()) {
            return of(true);
        }

        // If no refresh token, can't refresh
        const refreshToken = this._refreshToken();
        if (!refreshToken) {
            this.logout();
            return of(false);
        }

        // Try to refresh token
        return this.refreshToken().pipe(
            catchError(() => {
                this.logout();
                return of(false);
            })
        );
    }

    refreshToken(): Observable<boolean> {
        const refreshToken = this._refreshToken();

        if (!refreshToken) {
            return throwError(() => new Error('Няма наличен токен за обновяване'));
        }

        return this.authHttpService.refreshToken(refreshToken).pipe(
            tap((httpResponse) => {
                // Extract tokens from headers
                const accessToken = httpResponse.headers.get(HEADER_KEYS.AUTH_HEADER_KEY)?.replace(HEADER_KEYS.BEARER_KEY, '') ||
                    httpResponse.headers.get(TOKEN_KEYS.ACCESS_TOKEN)

                const newRefreshToken = httpResponse.headers.get(TOKEN_KEYS.REFRESH_TOKEN)

                if (accessToken) {
                    this._accessToken.set(accessToken);
                    this.updateUserFromToken(accessToken);
                }

                if (newRefreshToken) {
                    this._refreshToken.set(newRefreshToken);
                }
            }),
            map(() => {
                return true;
            }),
            catchError((error) => {
                this.logout();
                return throwError(() => new Error('Сесията изтече. Моля, влезте отново.'));
            })
        );
    }
}
