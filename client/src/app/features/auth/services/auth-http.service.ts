import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../common/constants/api-endpoints';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models';
import { ChangePasswordModel, UserEditProfileModel, UserProfileModel } from '../../profile/models';
import { PagedResult } from '../../../common/models/paged-result.model';

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
        // Глобалният interceptor ще обработи login грешките с подходящи съобщения
    }

    refreshToken(refreshToken: string): Observable<HttpResponse<AuthResponse>> {
        return this.http.post(`${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.REFRESH}`, {}, {
            headers: {
                'X-Refresh-Token': refreshToken
            },
            observe: 'response'
        });
        // Refresh token грешките се обработват от token interceptor
    }

    register(registerData: RegisterRequest): Observable<HttpResponse<AuthResponse>> {
        return this.http.post(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.REGISTER}`,
            registerData,
            { observe: 'response' }
        );
        // Глобалният interceptor ще обработи регистрационните грешки
    }

    updateProfile(updateUserRequest: UserEditProfileModel): Observable<HttpResponse<AuthResponse>> {
        return this.http.put(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.BASE}/${updateUserRequest.id}`,
            updateUserRequest,
            { observe: 'response' }
        );
        // Глобалният interceptor ще обработи грешките автоматично
    }

    deleteProfile(id: string): Observable<HttpResponse<void>> {
        return this.http.delete<void>(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.BASE}/${id}`,
            { observe: 'response' }
        );
        // Глобалният interceptor ще обработи грешките автоматично
    }

    getUserProfile(id: string): Observable<HttpResponse<UserProfileModel>> {
        return this.http.get<UserProfileModel>(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.BASE}/${id}`,
            { observe: 'response' }
        );
        // Глобалният interceptor ще обработи грешките автоматично
    }

    addRoleToUser(id: string, role: string) {
        return this.http.patch<void>(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.ADD_TO_ROLE}/${id}/${role}`,
            { observe: 'response' }
        );
        // Глобалният interceptor ще обработи грешките автоматично
    }
    removeRoleFromUser(id: string, role: string) {
        return this.http.patch<void>(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.REMOVE_FROM_ROLE}/${id}/${role}`,
            { observe: 'response' }
        );
        // Глобалният interceptor ще обработи грешките автоматично
    }


    private initializeQueryParams(pageNumber: number, pageSize: number, searchTerm: string | null, sortBy: string | null, sortDescending: string | null) {
        let params = new HttpParams()
            .set('pageNumber', pageNumber.toString())
            .set('pageSize', pageSize.toString());

        if (searchTerm) {
            params = params.set('searchTerm', searchTerm);
        }

        if (sortBy) {
            params = params.set('sortBy', sortBy);
        }

        if (sortDescending !== null) {
            params = params.set('sortDescending', sortDescending);
        }
        return params;
    }

    changePassword(userId: string, changePasswordRequest: ChangePasswordModel): Observable<HttpResponse<void>> {
        return this.http.patch<void>(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.CHANGE_PASSWORD}/${userId}`,
            changePasswordRequest,
            { observe: 'response' }
        );
        // Глобалният interceptor ще обработи грешките при смяна на парола
    }

    getMyAppointments(patientId: string, pageNumber: number, pageSize: number = 10, searchTerm: string | null = null, sortBy: string | null = null, sortDescending: string | null = null): Observable<HttpResponse<PagedResult<any>>> {
        let params = this.initializeQueryParams(pageNumber, pageSize, searchTerm, sortBy, sortDescending);
        params = params.set('patientId', patientId);

        return this.http.get<PagedResult<any>>(`${environment.baseUrl}${API_ENDPOINTS.APPOINTMENTS.BY_PATIENT}`,
            {
                params: params,
                observe: 'response'
            }
        );
        // Глобалният interceptor ще обработи грешките автоматично
    }
}
