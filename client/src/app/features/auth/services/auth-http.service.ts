import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../common/constants/api-endpoints';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models';
import { Utils } from '../../../common/utils';
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
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                const errorMessage = Utils.getErrorMessage(error, 'влизане');
                return throwError(() => ({ ...error, message: errorMessage }));
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

    register(registerData: RegisterRequest): Observable<HttpResponse<AuthResponse>> {
        return this.http.post(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.REGISTER}`,
            registerData,
            { observe: 'response' }
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                // Return the original HTTP error response instead of creating a new Error
                return throwError(() => error);
            })
        );
    }

    updateProfile(updateUserRequest: UserEditProfileModel): Observable<HttpResponse<AuthResponse>> {
        return this.http.put(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.BASE}/${updateUserRequest.id}`,
            updateUserRequest,
            { observe: 'response' }
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                const errorMessage = Utils.getErrorMessage(error, 'влизане');
                return throwError(() => new Error(errorMessage));
            })
        );
    }

    deleteProfile(id: string): Observable<HttpResponse<void>> {
        return this.http.delete<void>(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.BASE}/${id}`,
            { observe: 'response' }
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                const errorMessage = Utils.getErrorMessage(error, 'изтриване на профила');
                return throwError(() => new Error(errorMessage));
            })
        );
    }

    getUserProfile(id: string): Observable<HttpResponse<UserProfileModel>> {
        return this.http.get<UserProfileModel>(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.BASE}/${id}`,
            { observe: 'response' }
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                const errorMessage = Utils.getErrorMessage(error, 'профилните данни');
                return throwError(() => new Error(errorMessage));
            })
        );
    }

    getAllUsers(pageNumber: number, pageSize: number = 10, searchTerm: string | null = null, sortBy: string | null = null, sortDescending: string | null = null): Observable<HttpResponse<PagedResult<UserProfileModel>>> {
        let params = this.initializeQueryParams(pageNumber, pageSize, searchTerm, sortBy, sortDescending);

        return this.http.get<PagedResult<UserProfileModel>>(`${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.BASE}`,
            {
                params: params,
                observe: 'response'
            }
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                const errorMessage = Utils.getErrorMessage(error, 'профилните данни');
                return throwError(() => new Error(errorMessage));
            })
        );
    }


    addRoleToUser(id: string, role: string) {
        return this.http.patch<void>(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.ADD_TO_ROLE}/${id}/${role}`,
            { observe: 'response' }
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                const errorMessage = Utils.getErrorMessage(error, 'добавяне на роля');
                return throwError(() => new Error(errorMessage));
            })
        );
    }
    removeRoleFromUser(id: string, role: string) {
        return this.http.patch<void>(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.REMOVE_FROM_ROLE}/${id}/${role}`,
            { observe: 'response' }
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                const errorMessage = Utils.getErrorMessage(error, 'премахване на роля');
                return throwError(() => new Error(errorMessage));
            })
        );
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
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                const errorMessage = Utils.getErrorMessage(error, 'смяна на паролата');
                return throwError(() => ({ ...error, message: errorMessage }));
            })
        );
    }

    getMyAppointments(patientId: string, pageNumber: number, pageSize: number = 10, searchTerm: string | null = null, sortBy: string | null = null, sortDescending: string | null = null): Observable<HttpResponse<PagedResult<any>>> {
        let params = this.initializeQueryParams(pageNumber, pageSize, searchTerm, sortBy, sortDescending);
        params = params.set('patientId', patientId);

        return this.http.get<PagedResult<any>>(`${environment.baseUrl}${API_ENDPOINTS.APPOINTMENTS.BY_PATIENT}`,
            {
                params: params,
                observe: 'response'
            }
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                const errorMessage = Utils.getErrorMessage(error, 'записаните часове');
                return throwError(() => new Error(errorMessage));
            })
        );
    }
}
