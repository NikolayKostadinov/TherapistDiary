import { Injectable, DestroyRef, signal, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, tap, throwError, Observable } from 'rxjs';
import { UserListModel } from '../../profile/models/user-list.model';
import { UserProfileModel } from '../../profile/models';
import { ApiError, PagedResult } from '../../../common';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../common/constants/api-endpoints';
import { AuthHttpService } from '../../auth';


@Injectable({
    providedIn: 'root'
})
export class UserManagementService {
    private readonly authHttpService = inject(AuthHttpService);
    private readonly http = inject(HttpClient);
    private readonly destroyRef = inject(DestroyRef);


    private _usersPagedList = signal<PagedResult<UserListModel> | null>(null);
    private _isLoading = signal<boolean>(false);


    constructor() { }

    public get usersPagedList() {
        return this._usersPagedList.asReadonly();
    }

    public get isLoading() {
        return this._isLoading.asReadonly();
    }

    public getAllUsers(pageNumber: number, pageSize: number = 10, searchTerm: string | null = null, sortBy: string | null = null, sortDescending: string | null = null): Observable<HttpResponse<PagedResult<UserProfileModel>>> {
        let params = this.initializeQueryParams(pageNumber, pageSize, searchTerm, sortBy, sortDescending);

        return this.http.get<PagedResult<UserProfileModel>>(`${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.BASE}`,
            {
                params: params,
                observe: 'response'
            }
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

    public loadUsers(pageNumber: number = 1, pageSize: number = 10, searchTerm: string | null = null, sortBy: string | null = null, sortDescending: string | null = null): void {
        this._isLoading.set(true);
        this.getAllUsers(pageNumber, pageSize, searchTerm, sortBy, sortDescending)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                map(response => response
                    ? <PagedResult<UserListModel> | null>{
                        ...response.body!,
                        items: response.body!.items.map(user => {
                            return ({
                                ...user,
                                rolesView: user.roles.length
                                    ? user.roles.map(role => role.name).join(', ')
                                    : '-'
                            }) as UserListModel;
                        })
                    }
                    : null),
                catchError((error) => {
                    return throwError(() => error);
                })
            ).subscribe({
                next: (usersPagedList: PagedResult<UserListModel> | null) => {
                    this._usersPagedList.set(usersPagedList);
                    this._isLoading.set(false);
                },
                error: (error: ApiError) => {
                    this._usersPagedList.set(null);
                    this._isLoading.set(false);
                    console.error('Error loading user profiles:', error);
                },
            });
    }

    deleteProfile(userId: string) {
        return this.authHttpService.deleteProfile(userId)
            .pipe(
                tap(() => {
                    this.loadUsers();
                }),
                map(() => void 0), // Return void
                takeUntilDestroyed(this.destroyRef),
                catchError((error) => {
                    return throwError(() => error);
                })
            );
    }

    toggleUserRole(id: string, role: string) {
        const user = this.usersPagedList()?.items.find(u => u.id === id);
        if (user) {
            if (this.userInRole(user, role)) {
                return this.authHttpService.removeRoleFromUser(id, role)
                    .pipe(
                        tap(() => {
                            this.loadUsers();
                        }),
                        map(() => void 0), // Return void
                        takeUntilDestroyed(this.destroyRef),
                        catchError((error) => {
                            return throwError(() => error);
                        })
                    );

            } else {
                return this.authHttpService.addRoleToUser(id, role)
                    .pipe(
                        tap(() => {
                            this.loadUsers();
                        }), map(() => void 0), // Return void
                        takeUntilDestroyed(this.destroyRef),
                        catchError((error) => {
                            return throwError(() => error);
                        })
                    );
            }
        } else {
            return throwError(() => new Error('Потребителят не е намерен'));
        }
    }

    private userInRole(user: UserListModel, role: string) {
        return user.roles.some(r => r.name === role);
    }
}
