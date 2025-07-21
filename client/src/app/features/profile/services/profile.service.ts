import { effect, Injectable, signal, DestroyRef, inject, computed } from '@angular/core';
import { AuthService } from "../../auth";
import { HttpClient } from '@angular/common/http';
import { UserProfileModel } from '../models';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../../../common/constants/api-endpoints';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../../environments/environment';
import { Utils } from '../../../common/utils';

@Injectable({
    providedIn: 'root'
})
export class ProfileServices {
    private readonly destroyRef = inject(DestroyRef);
    private apiUrl = `${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.PROFILE}`;
    private _user = signal<UserProfileModel | null>(null);
    private _isLoading = signal<boolean>(false);
    private _errorMessage = signal<string | null>(null);

    public readonly userProfile = computed(() => this._user());
    public readonly isLoading = computed(() => this._isLoading());
    public readonly errorMessage = computed(() => this._errorMessage());
    public readonly hasError = computed(() => !!this._errorMessage());

    constructor(
        private readonly httpClient: HttpClient,
        private readonly authService: AuthService,
    ) {
        effect(() => {
            const currentUser = this.authService.currentUser();

            if (currentUser) {
                this.loadUserProfile(currentUser.id);
            } else {
                this._user.set(null);
                this._errorMessage.set(null);
                this._isLoading.set(false);
            }
        });
    }

    public refreshProfile(): void {
        const currentUser = this.authService.currentUser();
        if (currentUser) {
            this.loadUserProfile(currentUser.id);
        }
    }

    public clearError(): void {
        this._errorMessage.set(null);
    }

    public updateProfile(updatedProfile: UserProfileModel): Observable<UserProfileModel> {
        return this.httpClient.put<UserProfileModel>(this.apiUrl, updatedProfile)
            .pipe(
                tap((profile) => {
                    this._user.set(profile);
                    this._errorMessage.set(null);
                    this._isLoading.set(false);
                }),
                takeUntilDestroyed(this.destroyRef),
                catchError((error) => {
                    this._errorMessage.set('Неуспешно обновяване на профила');
                    return throwError(() => error);
                })
            );
    }


     }

    public deleteProfile(id: string): Observable<void> {
        return this.httpClient.delete<void>(`${environment.baseUrl}${API_ENDPOINTS.ACCOUNT.DELETE}/${id}`)
            .pipe(
                tap(() => {
                    this._user.set(null);
                    this._errorMessage.set(null);
                    this._isLoading.set(false);
                    this.authService.logout();
                }),
                takeUntilDestroyed(this.destroyRef),
                catchError((error) => {
                    this._errorMessage.set('Неуспешно изтриване на профила');
                    return throwError(() => error);
                })
            );
    }

    private fetchUserProfile(id: string): Observable<UserProfileModel> {
        return this.httpClient.get<UserProfileModel>(`${this.apiUrl}/${id}`);
    }

    private loadUserProfile(id: string): void {
        // Set loading state
        this._isLoading.set(true);
        this._errorMessage.set(null);

        this.fetchUserProfile(id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (profile: UserProfileModel) => {
                    this._user.set(profile);
                    this._isLoading.set(false);
                    this._errorMessage.set(null);
                },
                error: (error) => {
                    this._user.set(null);
                    this._isLoading.set(false);

                    // Set user-friendly error message using Utils
                    const errorMsg = Utils.getErrorMessage(error, 'профилните данни');
                    this._errorMessage.set(errorMsg);
                }
            });
    }


}