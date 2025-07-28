import { Injectable, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, tap, throwError } from 'rxjs';
import { UserListModel } from '../../profile/models/user-list.model';
import { ApiError, PagedResult } from '../../../common';
import { AuthHttpService } from '../../auth';


@Injectable({
    providedIn: 'root'
})
export class UserManagementService {

    private _usersPagedList = signal<PagedResult<UserListModel> | null>(null);
    private _isLoading = signal<boolean>(false);


    constructor(
        private readonly authHttpService: AuthHttpService,
        private readonly destroyRef: DestroyRef
    ) { }

    public get usersPagedList() {
        return this._usersPagedList.asReadonly();
    }

    public get isLoading() {
        return this._isLoading.asReadonly();
    }

    public loadUsers(pageNumber: number = 1, pageSize: number = 10, searchTerm: string | null = null, sortBy: string | null = null, sortDescending: string | null = null): void {
        this._isLoading.set(true);
        this.authHttpService.getAllUsers(pageNumber, pageSize, searchTerm, sortBy, sortDescending)
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
