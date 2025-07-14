import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { AuthTokens, JwtPayload, UserInfo } from '../models';
import { LocalStorageService } from '../../../common/services';

/**
 * Service responsible for token management (storage, validation, decoding)
 */
@Injectable({
    providedIn: 'root'
})
export class TokenService {
    private readonly ACCESS_TOKEN_KEY = 'X-Access-Token';
    private readonly REFRESH_TOKEN_KEY = 'X-Refresh-Token';

    constructor(private readonly storageService: LocalStorageService) { }


    get accessToken(): string | null {
        return this.storageService.getItem(this.ACCESS_TOKEN_KEY);
    }

    set accessToken(token: string) {
        this.storageService.setItem(this.ACCESS_TOKEN_KEY, token);
    }

    get refreshToken(): string | null {
        return this.storageService.getItem(this.REFRESH_TOKEN_KEY);
    }

    set refreshToken(token: string) {
        this.storageService.setItem(this.REFRESH_TOKEN_KEY, token);
    }


    get tokens(): AuthTokens {
        return {
            accessToken: this.accessToken,
            refreshToken: this.refreshToken
        };
    }

    /**
     * Decode JWT token and extract user information
     */
    get userInfo(): UserInfo | null {
        const token = this.storageService.getItem(this.ACCESS_TOKEN_KEY);
        if (!token) return null;

        try {
            const payload = jwtDecode<JwtPayload>(token);
            const currentTime = Math.floor(Date.now() / 1000);
            const isExpired = payload.exp < currentTime;

            return {
                id: payload.sub,
                email: payload.email,
                username: payload.username,
                roles: this.extractRoles(payload),
                isExpired
            };
        } catch (error) {
            console.error('Error decoding JWT token:', error);
            return null;
        }
    }


    clearTokens(): void {
        this.storageService.removeItem(this.ACCESS_TOKEN_KEY);
        this.storageService.removeItem(this.REFRESH_TOKEN_KEY);
    }

    /**
     * Check if access token exists
     */
    hasAccessToken(): boolean {
        return Boolean(this.storageService.getItem(this.ACCESS_TOKEN_KEY));
    }

    /**
     * Check if access token is expired
     */
    isTokenExpired(): boolean {
        const token = this.storageService.getItem(this.ACCESS_TOKEN_KEY);
        if (!token) return true;

        try {
            const payload = jwtDecode<JwtPayload>(token);
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp < currentTime;
        } catch (error) {
            console.error('Error decoding JWT token:', error);
            return true;
        }
    }

    /**
     * Check if token will expire soon (within 5 minutes)
     */
    isTokenExpiringSoon(): boolean {
        const token = this.storageService.getItem(this.ACCESS_TOKEN_KEY);
        if (!token) return true;

        try {
            const payload = jwtDecode<JwtPayload>(token);
            const currentTime = Math.floor(Date.now() / 1000);
            const fiveMinutesFromNow = currentTime + (5 * 60); // 5 minutes in seconds
            return payload.exp < fiveMinutesFromNow;
        } catch (error) {
            console.error('Error decoding JWT token:', error);
            return true;
        }
    }

    /**
     * Check if token is valid (exists and not expired)
     */
    isTokenValid(): boolean {
        return this.hasAccessToken() && !this.isTokenExpired();
    }

    /**
     * Extract roles from JWT payload (handles different role formats)
     */
    private extractRoles(payload: JwtPayload): string[] {
        if (payload.roles && Array.isArray(payload.roles)) {
            return payload.roles;
        }

        if (payload.role) {
            return Array.isArray(payload.role) ? payload.role : [payload.role];
        }

        return [];
    }

    /**
     * Verify tokens are properly stored (for debugging)
     */
    verifyTokenStorage(): void {
        const storedAccessToken = this.storageService.getItem(this.ACCESS_TOKEN_KEY);
        if (!storedAccessToken) {
            console.error('CRITICAL: Access token was not stored in localStorage!');
        } else {
            console.log('SUCCESS: Access token stored and verified in localStorage');
        }

        console.log('Token storage verification:', {
            accessToken: this.hasAccessToken(),
            refreshToken: Boolean(this.storageService.getItem(this.REFRESH_TOKEN_KEY))
        });
    }
}