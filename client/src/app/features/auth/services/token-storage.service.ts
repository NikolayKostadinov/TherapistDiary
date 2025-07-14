import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { TokenService } from './token.service';
import { AuthResponse } from '../models';

/**
 * Service responsible for extracting and storing tokens from HTTP responses
 */
@Injectable({
    providedIn: 'root'
})
export class TokenStorageService {
    constructor(private readonly tokenService: TokenService) { }

    storeTokensFromResponse(response: HttpResponse<AuthResponse>): void {
        this.extractAndStoreFromHeaders(response);
        this.tokenService.verifyTokenStorage();
    }

    private extractAndStoreFromHeaders(response: HttpResponse<AuthResponse>): void {
        // Backend exposes tokens in headers via CORS
        const accessToken = response.headers.get('X-Access-Token');
        const refreshToken = response.headers.get('X-Refresh-Token');

        // Store access token
        if (accessToken) {
            this.tokenService.accessToken = accessToken;
            console.log('Access token stored successfully');
        }

        // Store refresh token
        if (refreshToken) {
            this.tokenService.refreshToken = refreshToken;
            console.log('Refresh token stored successfully');
        }
    }
}
