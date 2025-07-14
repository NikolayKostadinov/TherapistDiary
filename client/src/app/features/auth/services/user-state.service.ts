import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserInfo } from '../models';
import { TokenService } from './token.service';

/**
 * Service responsible for managing user authentication state
 */
@Injectable({
    providedIn: 'root'
})
export class UserStateService {
    // Reactive state for authentication
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    // Reactive state for current user
    private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    // Synchronous getters for immediate access
    get isAuthenticated(): boolean {
        return this.isAuthenticatedSubject.value;
    }

    get currentUser(): UserInfo | null {
        return this.currentUserSubject.value;
    }

    constructor(private readonly tokenService: TokenService) { }


    setAuthenticated(userInfo?: UserInfo): void {
        this.isAuthenticatedSubject.next(true);

        if (userInfo) {
            this.currentUserSubject.next(userInfo);
        } else {
            // Get user info from token if not provided
            const userFromToken = this.tokenService.userInfo;
            this.currentUserSubject.next(userFromToken);
        }
    }

    setUnauthenticated(): void {
        this.isAuthenticatedSubject.next(false);
        this.currentUserSubject.next(null);
    }


    updateUserFromToken(): void {
        const userInfo = this.tokenService.userInfo;
        this.currentUserSubject.next(userInfo);
    }

    initializeFromStoredTokens(): void {
        if (!this.tokenService.hasAccessToken()) {
            this.setUnauthenticated();
            return;
        }

        if (this.tokenService.isTokenValid()) {
            this.setAuthenticated();
        } else {
            this.setUnauthenticated();
        }
    }

    logout(): void {
        this.tokenService.clearTokens();
        this.setUnauthenticated();
    }
}
