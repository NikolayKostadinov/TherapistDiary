import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../common/constants/api-endpoints';
import { LoginRequest, AuthResponse } from '../models';
import { Utils } from '../../../common/utils';

/**
 * Service responsible for authentication-related HTTP requests
 */
@Injectable({
    providedIn: 'root'
})
export class AuthHttpService {
    constructor(private readonly http: HttpClient) { }

    login(loginData: LoginRequest): Observable<HttpResponse<AuthResponse>> {
        return this.http.post(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.LOGIN}`,
            loginData,
            { observe: 'response' }
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                const errorMessage = Utils.getErrorMessage(error, 'влизане');
                return throwError(() => new Error(errorMessage));
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
                const errorMessage = error.status === 401 ?
                    'Сесията изтече. Моля, влезте отново.' :
                    Utils.getErrorMessage(error, 'обновяване на сесията');
                return throwError(() => new Error(errorMessage));
            })
        );
    }
}
