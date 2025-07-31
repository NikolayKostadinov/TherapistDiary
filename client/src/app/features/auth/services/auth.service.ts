import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { AuthHttpService } from '.';
import { HEADER_KEYS, TOKEN_KEYS } from '../../../common/constants';
import { AuthResponse, JwtPayload, LoginRequest, RegisterRequest, UserInfo } from '../models';
import { HttpResponse } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly authHttpService = inject(AuthHttpService);


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

    constructor() {
        this.initializeFromStorage();
        this.setupTokenSync();
    }

    private initializeFromStorage(): void {
        const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
        const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);

        console.log('🔍 Auth initialization:', { 
            hasAccessToken: !!accessToken, 
            hasRefreshToken: !!refreshToken,
            accessTokenLength: accessToken?.length || 0
        });

        this._accessToken.set(accessToken);
        this._refreshToken.set(refreshToken);

        if (accessToken && refreshToken) {
            // Check if access token is expired
            try {
                const payload = jwtDecode<JwtPayload>(accessToken);
                const currentTime = Math.floor(Date.now() / 1000);
                const isExpired = payload.exp < currentTime;

                console.log('📝 Token check:', { 
                    expiration: new Date(payload.exp * 1000),
                    currentTime: new Date(currentTime * 1000),
                    isExpired 
                });

                if (isExpired) {
                    console.log('🔄 Token expired, attempting refresh...');
                    // Don't logout immediately, try to refresh first
                    this.refreshToken().subscribe({
                        next: (success) => {
                            console.log('✅ Token refreshed successfully during initialization');
                        },
                        error: (error) => {
                            console.log('❌ Token refresh failed during initialization:', error);
                            this.logout();
                        }
                    });
                } else {
                    console.log('✅ Token is valid, updating user info');
                    // Token is valid, update user info
                    this.updateUserFromToken(accessToken);
                }
            } catch (error) {
                console.log('❌ Token decode error:', error);
                // Try to refresh if we have refresh token, otherwise logout
                if (refreshToken) {
                    this.refreshToken().subscribe({
                        error: () => {
                            console.log('❌ Refresh failed, logging out');
                            this.logout();
                        }
                    });
                } else {
                    console.log('❌ No refresh token, logging out');
                    this.logout();
                }
            }
        } else if (accessToken && !refreshToken) {
            console.log('⚠️ Only access token available, checking validity');
            // Only access token, check if valid
            this.updateUserFromToken(accessToken);
        } else {
            console.log('ℹ️ No tokens found, user stays logged out');
        }
        // If no tokens, user stays logged out (default state)
    }

    private setupTokenSync(): void {
        // Auto-sync tokens with localStorage
        effect(() => {
            const accessToken = this._accessToken();
            if (accessToken) {
                localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
                console.log('💾 Access token saved to localStorage');
            } else {
                localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
                console.log('🗑️ Access token removed from localStorage');
            }
        });

        effect(() => {
            const refreshToken = this._refreshToken();
            if (refreshToken) {
                localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
                console.log('💾 Refresh token saved to localStorage');
            } else {
                localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);  
                console.log('🗑️ Refresh token removed from localStorage');
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
                    userName: payload.unique_name,
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
        if (payload.roles) {
            if (Array.isArray(payload.roles)) {
                return payload.roles;
            } else if (typeof payload.roles === 'string') {
                return [payload.roles];
            }
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
                // Check for tokens in response body first
                const responseBody = httpResponse.body as any;
                let accessToken: string | null = null;
                let refreshToken: string | null = null;

                // Try to get tokens from response body
                if (responseBody) {
                    accessToken = responseBody.accessToken || responseBody.access_token || responseBody.token;
                    refreshToken = responseBody.refreshToken || responseBody.refresh_token;
                }

                // Fallback to headers if not found in body
                if (!accessToken) {
                    accessToken = httpResponse.headers.get(HEADER_KEYS.AUTH_HEADER_KEY)?.replace(HEADER_KEYS.BEARER_KEY, '')
                        || httpResponse.headers.get(TOKEN_KEYS.ACCESS_TOKEN);
                }

                if (!refreshToken) {
                    refreshToken = httpResponse.headers.get(TOKEN_KEYS.REFRESH_TOKEN);
                }

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
        console.log('🚪 Logout initiated - clearing all tokens and user data');
        // Clear all signals
        this._accessToken.set(null);
        this._refreshToken.set(null);
        this._currentUser.set(null);
        console.log('✅ Logout completed');
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

        console.log('🔄 Attempting token refresh...');

        return this.authHttpService.refreshToken(refreshToken).pipe(
            tap((httpResponse) => {
                // Extract tokens from headers
                const accessToken = httpResponse.headers.get(HEADER_KEYS.AUTH_HEADER_KEY)?.replace(HEADER_KEYS.BEARER_KEY, '') ||
                    httpResponse.headers.get(TOKEN_KEYS.ACCESS_TOKEN)

                const newRefreshToken = httpResponse.headers.get(TOKEN_KEYS.REFRESH_TOKEN)

                if (accessToken) {
                    this._accessToken.set(accessToken);
                    this.updateUserFromToken(accessToken);
                    console.log('✅ Token refresh successful');
                }

                if (newRefreshToken) {
                    this._refreshToken.set(newRefreshToken);
                }
            }),
            map(() => {
                return true;
            }),
            catchError((error) => {
                console.log('❌ Token refresh failed:', error.status, error.message);
                
                // Only logout for authentication-related errors
                if (error?.status === 401 || error?.status === 403 || 
                    (error?.message && error.message.includes('refresh')) ||
                    (error?.error && typeof error.error === 'string' && 
                     (error.error.includes('token') || error.error.includes('expired')))) {
                    console.log('🚪 Authentication error during refresh, logging out');
                    this.logout();
                    return throwError(() => new Error('Сесията изтече. Моля, влезте отново.'));
                } else {
                    console.log('⚠️ Server error during refresh, but not logging out');
                    return throwError(() => new Error('Временен проблем със сървъра. Моля, опитайте отново.'));
                }
            })
        );
    }

    /**
     * Processes authentication response and updates tokens from headers or body
     */
    processAuthResponse(response: AuthResponse): void {
        let accessToken: string | null = null;
        let refreshToken: string | null = null;

        // Fallback to headers if not found in body
        if (!accessToken && response.headers) {
            accessToken = response.headers.get(TOKEN_KEYS.ACCESS_TOKEN);
            refreshToken = response.headers.get(TOKEN_KEYS.REFRESH_TOKEN);
        }

        // Update tokens if found
        if (accessToken) {
            this._accessToken.set(accessToken);
            this.updateUserFromToken(accessToken);
        }
        if (refreshToken) {
            this._refreshToken.set(refreshToken);
        }
    }

    updateTokensFromResponse(httpResponse: HttpResponse<AuthResponse>) {
        const accessToken = httpResponse.headers.get(TOKEN_KEYS.ACCESS_TOKEN);
        const refreshToken = httpResponse.headers.get(TOKEN_KEYS.REFRESH_TOKEN);

        if (accessToken) {
            this._accessToken.set(accessToken);
            this.updateUserFromToken(accessToken);
        }

        if (refreshToken) {
            this._refreshToken.set(refreshToken);
        }
    }
}
