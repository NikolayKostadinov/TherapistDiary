import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { catchError, map, throwError, Observable } from 'rxjs';
import { UserListModel } from '../../profile/models/user-list.model';
import { UserProfileModel } from '../../profile/models';
import { PagedFilteredRequest, PagedResult } from '../../../common';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../common/constants/api-endpoints';
import { AuthHttpService } from '../../auth';


@Injectable({
    providedIn: 'root'
})
export class UserManagementService {
    private readonly authHttpService = inject(AuthHttpService);
    private readonly http = inject(HttpClient);

    public getAllUsers(request: PagedFilteredRequest): Observable<HttpResponse<PagedResult<UserProfileModel>>> {
        let params = this.initializeQueryParams(request);

        return this.http.get<PagedResult<UserProfileModel>>(`${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.BASE}`,
            {
                params: params,
                observe: 'response'
            }
        );
    }

    deleteProfile(userId: string): Observable<void> {
        return this.authHttpService.deleteProfile(userId)
            .pipe(
                map(() => void 0),
                catchError((error) => throwError(() => error))
            );
    }

    toggleUserRole(user: UserListModel, role: string): Observable<void> {
        if (this.userInRole(user, role)) {
            return this.removeRoleFromUser(user.id, role)
                .pipe(
                    map(() => void 0),
                    catchError((error) => throwError(() => error))
                );
        } else {
            return this.addRoleToUser(user.id, role)
                .pipe(
                    map(() => void 0),
                    catchError((error) => throwError(() => error))
                );
        }
    }

    private initializeQueryParams(request: PagedFilteredRequest): HttpParams {
        let params = new HttpParams()
            .set('pageNumber', request.pageNumber.toString())
            .set('pageSize', request.pageSize ? request.pageSize.toString() : '10');

        if (request.searchTerm) {
            params = params.set('searchTerm', request.searchTerm);
        }

        if (request.sortBy) {
            params = params.set('sortBy', request.sortBy);
        }

        if (request.sortDescending !== null) {
            params = params.set('sortDescending', request.sortDescending ?? false);
        }
        return params;
    }

    private addRoleToUser(id: string, role: string): Observable<HttpResponse<void>> {
        return this.http.patch<void>(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.ADD_TO_ROLE}/${id}/${role}`,
            {},
            { observe: 'response' }
        );
    }

    private removeRoleFromUser(id: string, role: string): Observable<HttpResponse<void>> {
        return this.http.patch<void>(
            `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.REMOVE_FROM_ROLE}/${id}/${role}`,
            {},
            { observe: 'response' }
        );
    }

    private userInRole(user: UserListModel, role: string) {
        return user.roles.some(r => r.name === role);
    }
}
