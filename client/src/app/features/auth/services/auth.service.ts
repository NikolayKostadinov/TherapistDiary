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

    private _accessToken = signal<string | null>(null);
    private _refreshToken = signal<string | null>(null);
    private _currentUser = signal<UserInfo | null>(null);

    readonly isLoggedIn = computed(() =>
        !!this._accessToken() && !!this._currentUser()
    );

    readonly currentUser = computed(() =>
        this._currentUser()
    );

    readonly accessToken = computed(() =>
        this._accessToken()
    );

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

        this._accessToken.set(accessToken);
        this._refreshToken.set(refreshToken);

        if (accessToken && refreshToken) {
            try {
                const payload = jwtDecode<JwtPayload>(accessToken);
                const currentTime = Math.floor(Date.now() / 1000);
                const isExpired = payload.exp < currentTime;

                if (isExpired) {

                    this.refreshToken().subscribe({
                        error: (error) => {
                            this.logout();
                        }
                    });
                } else {
                    this.updateUserFromToken(accessToken);
                }
            } catch (error) {
                if (refreshToken) {
                    this.refreshToken().subscribe({
                        error: () => {
                            this.logout();
                        }
                    });
                } else {
                    this.logout();
                }
            }
        } else if (accessToken && !refreshToken) {
            this.updateUserFromToken(accessToken);
        }
    }

    private setupTokenSync(): void {
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
                    userName: payload.unique_name,
                    fullName: payload.fullName,
                    profilePictureUrl: payload.profilePictureUrl,
                    roles: this.extractRoles(payload),
                    isExpired
                };

                this._currentUser.set(userInfo);
            } else {
                this._currentUser.set(null);
            }
        } catch (error) {
            this._currentUser.set(null);
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
            map(() => void 0), 
            catchError((error) => {
                return throwError(() => error);
            })
        );
    }

    register(registerData: RegisterRequest): Observable<void> {
        return this.authHttpService.register(registerData).pipe(
            tap((httpResponse) => {
                const responseBody = httpResponse.body as any;
                let accessToken: string | null = null;
                let refreshToken: string | null = null;

                if (responseBody) {
                    accessToken = responseBody.accessToken || responseBody.access_token || responseBody.token;
                    refreshToken = responseBody.refreshToken || responseBody.refresh_token;
                }

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
        this._accessToken.set(null);
        this._refreshToken.set(null);
        this._currentUser.set(null);
    }

    initializeAuth(): void {
        this.initializeFromStorage();
    }

    ensureValidToken(): Observable<boolean> {
        if (this.isTokenValid()) {
            return of(true);
        }

        const refreshToken = this._refreshToken();
        if (!refreshToken) {
            this.logout();
            return of(false);
        }

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
                if (error?.status === 401 || error?.status === 403 ||
                    (error?.message && error.message.includes('refresh')) ||
                    (error?.error && typeof error.error === 'string' &&
                        (error.error.includes('token') || error.error.includes('expired')))) {
                    this.logout();
                    return throwError(() => new Error('Сесията изтече. Моля, влезте отново.'));
                } else {
                    return throwError(() => new Error('Временен проблем със сървъра. Моля, опитайте отново.'));
                }
            })
        );
    }

    processAuthResponse(response: AuthResponse): void {
        let accessToken: string | null = null;
        let refreshToken: string | null = null;

        if (!accessToken && response.headers) {
            accessToken = response.headers.get(TOKEN_KEYS.ACCESS_TOKEN);
            refreshToken = response.headers.get(TOKEN_KEYS.REFRESH_TOKEN);
        }

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

    getReturnUrl(): string {
        return localStorage.getItem('returnUrl') || '/';
    }

    setReturnUrl(url: string): void {
        localStorage.setItem('returnUrl', url);
    }

    clearReturnUrl(): void {
        localStorage.removeItem('returnUrl');
    }
}
