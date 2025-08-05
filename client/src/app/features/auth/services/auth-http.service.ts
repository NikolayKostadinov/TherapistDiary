import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models';
import { ChangePasswordModel, UserEditProfileModel, UserProfileModel } from '../../profile/models';
import { API_ENDPOINTS } from '../../../common';

/**
 * Service responsible for authentication-related HTTP requests
 */
@Injectable({
    providedIn: 'root'
})
export class AuthHttpService {

    constructor(private readonly http: HttpClient) { }

    login(loginRequest: LoginRequest): Observable<HttpResponse<AuthResponse>> {
        return this.http.post(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.LOGIN}`,
            loginRequest,
            { observe: 'response' }
        );
    }

    refreshToken(refreshToken: string): Observable<HttpResponse<AuthResponse>> {
        return this.http.post(`${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.REFRESH}`, {}, {
            headers: {
                'X-Refresh-Token': refreshToken
            },
            observe: 'response'
        });
    }

    register(registerData: RegisterRequest): Observable<HttpResponse<AuthResponse>> {
        return this.http.post(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.REGISTER}`,
            registerData,
            { observe: 'response' }
        );
    }

    updateProfile(updateUserRequest: UserEditProfileModel): Observable<HttpResponse<AuthResponse>> {
        return this.http.put(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.BASE}/${updateUserRequest.id}`,
            updateUserRequest,
            { observe: 'response' }
        );
    }

    deleteProfile(id: string): Observable<HttpResponse<void>> {
        return this.http.delete<void>(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.BASE}/${id}`,
            { observe: 'response' }
        );
    }

    getUserProfile(id: string): Observable<HttpResponse<UserProfileModel>> {
        return this.http.get<UserProfileModel>(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.BASE}/${id}`,
            { observe: 'response' }
        );
    }

    changePassword(userId: string, changePasswordRequest: ChangePasswordModel): Observable<HttpResponse<void>> {
        return this.http.patch<void>(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.CHANGE_PASSWORD}/${userId}`,
            changePasswordRequest,
            { observe: 'response' }
        );
    }
}
