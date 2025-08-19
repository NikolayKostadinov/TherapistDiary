import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, tap, shareReplay } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { AuthHttpService } from '.';
import { HEADER_KEYS, TOKEN_KEYS } from '../../../common/constants';
import { AuthResponse, AuthTokens, JwtPayload, LoginRequest, RegisterRequest, UserInfo } from '../models';
import { HttpResponse } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly authHttpService = inject(AuthHttpService);

    // Споделен Observable за refresh операцията
    private refreshInProgress$: Observable<boolean> | null = null;

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
        return token ? !this.isTokenExpired(token) : false;
    });

    readonly isAuthenticated = computed(() =>
        this.isLoggedIn() && this.isTokenValid()
    );

    constructor() {
        this.initializeFromStorage();
        this.setupTokenSync();
    }

    initializeAuth(): void {
        this.initializeFromStorage();
    }

    login(loginData: LoginRequest): Observable<HttpResponse<AuthResponse>> {
        return this.authHttpService.login(loginData).pipe(
            tap((httpResponse) => {
                const { accessToken, refreshToken } = this.extractTokensFromResponse(httpResponse);
                this.updateTokens(accessToken, refreshToken);
            })
        );
    }

    register(registerData: RegisterRequest): Observable<HttpResponse<AuthResponse>> {
        return this.authHttpService.register(registerData).pipe(
            tap((httpResponse) => {
                const { accessToken, refreshToken } = this.extractTokensFromResponse(httpResponse);
                this.updateTokens(accessToken, refreshToken);
            })
        );
    }

    logout(): void {
        this._accessToken.set(null);
        this._refreshToken.set(null);
        this._currentUser.set(null);
        this.refreshInProgress$ = null;
    }

    refreshToken(): Observable<boolean> {
        // Ако вече има refresh операция в ход, върни я
        if (this.refreshInProgress$) {
            return this.refreshInProgress$;
        }

        const refreshToken = this._refreshToken();

        if (!refreshToken) {
            return throwError(() => new Error('Няма наличен токен за обновяване'));
        }

        // Създай нова refresh операция и я споделя между всички извиквания
        this.refreshInProgress$ = this.authHttpService.refreshToken(refreshToken).pipe(
            tap((httpResponse) => {
                const { accessToken, refreshToken } = this.extractTokensFromResponse(httpResponse);
                this.updateTokens(accessToken, refreshToken);

                // Изчисти refresh операцията след успех
                this.refreshInProgress$ = null;
            }),
            map(() => true),
            catchError((error) => {
                // Изчисти refresh операцията при грешка
                this.refreshInProgress$ = null;

                if (error?.status === 401 || error?.status === 403 ||
                    (error?.message && error.message.includes('refresh')) ||
                    (error?.error && typeof error.error === 'string' &&
                        (error.error.includes('token') || error.error.includes('expired')))) {
                    this.logout();
                    return throwError(() => new Error('Сесията изтече. Моля, влезте отново.'));
                } else {
                    return throwError(() => new Error('Временен проблем със сървъра. Моля, опитайте отново.'));
                }
            }),
            shareReplay(1) // Сподели резултата между всички subscribers
        );

        return this.refreshInProgress$;
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

    /**
     * Асинхронна проверка на автентикацията с автоматичен refresh при нужда
     */
    checkAuthenticationAsync(): Observable<boolean> {
        // Ако няма токени изобщо
        if (!this._accessToken() && !this._refreshToken()) {
            return of(false);
        }

        // Ако токенът е валиден
        if (this.isAuthenticated()) {
            return of(true);
        }

        // Ако токенът е изтекъл, но има refresh token
        if (this._accessToken() && !this.isTokenValid() && this._refreshToken()) {
            return this.refreshToken().pipe(
                map(() => this.isAuthenticated()),
                catchError(() => of(false))
            );
        }

        // Други случаи
        return of(false);
    }

    private initializeFromStorage(): void {
        const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
        const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);

        this._accessToken.set(accessToken);
        this._refreshToken.set(refreshToken);

        if (accessToken) {
            // Ако токенът е изтекъл и има refresh token, опитай да обновиш
            if (this.isTokenExpired(accessToken) && refreshToken) {
                this.refreshToken().subscribe({
                    error: () => this.logout()
                });
            } else {
                this.updateUserFromToken(accessToken);
            }
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

            if (!this.isTokenExpired(token)) {
                const userInfo: UserInfo = {
                    id: payload.sub,
                    email: payload.email,
                    userName: payload.unique_name,
                    fullName: payload.fullName,
                    profilePictureUrl: payload.profilePictureUrl,
                    roles: this.extractRoles(payload),
                    isExpired: false
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

    extractTokensFromResponse(httpResponse: HttpResponse<AuthResponse>): AuthTokens {
        let accessToken: string | null = null;
        let refreshToken: string | null = null;

        // Търси в headers
        accessToken =  httpResponse.headers.get(TOKEN_KEYS.ACCESS_TOKEN);
        refreshToken = httpResponse.headers.get(TOKEN_KEYS.REFRESH_TOKEN);

        return { accessToken, refreshToken };
    }

    updateTokens(accessToken: string | null, refreshToken: string | null): void {
        if (accessToken) {
            this._accessToken.set(accessToken);
            this.updateUserFromToken(accessToken);
        }

        if (refreshToken) {
            this._refreshToken.set(refreshToken);
        }
    }

    private isTokenExpired(token: string): boolean {
        try {
            const payload = jwtDecode<JwtPayload>(token);
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp <= currentTime;
        } catch {
            return true;
        }
    }
}
