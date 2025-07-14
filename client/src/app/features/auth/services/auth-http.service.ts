import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../common/api-endpoints';
import { LoginRequest, AuthResponse } from '../models';

/**
 * Service responsible for authentication-related HTTP requests
 */
@Injectable({
    providedIn: 'root'
})
export class AuthHttpService {
    constructor(private readonly http: HttpClient) { }

    login(loginData: LoginRequest): Observable<HttpResponse<AuthResponse>> {
        console.log('Sending login request...');
        return this.http.post(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.LOGIN}`,
            loginData,
            { observe: 'response' }
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Login HTTP request failed:', error);
                return throwError(() => this.handleAuthError(error));
            })
        );
    }

    refreshToken(refreshToken: string): Observable<HttpResponse<AuthResponse>> {
        return this.http.post(`${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.REFRESH}`, {}, {
            headers: {
                'X-Refresh-Token': refreshToken
            },
            observe: 'response'
        }).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Token refresh HTTP request failed:', error);
                return throwError(() => new Error('Session expired. Please login again.'));
            })
        );
    }

    private handleAuthError(error: HttpErrorResponse): Error {
        let errorMsg = 'Възникна грешка при влизане. Моля опитайте отново.';

        switch (error.status) {
            case 401:
                errorMsg = 'Неправилно потребителско име или парола.';
                break;
            case 400:
                errorMsg = error.error?.message || 'Невалидни данни.';
                break;
            case 0:
                errorMsg = 'Не може да се свърже със сървъра. Моля проверете интернет връзката си.';
                break;
            case 500:
                errorMsg = 'Вътрешна грешка на сървъра. Моля опитайте по-късно.';
                break;
        }

        return new Error(errorMsg);
    }
}
