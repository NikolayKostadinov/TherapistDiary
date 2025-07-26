import { effect, Injectable, signal, DestroyRef, inject, computed } from '@angular/core';
import { AuthHttpService, AuthService } from "../../auth";
import { ChangePasswordModel, UserEditProfileModel, UserProfileModel } from '../models';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Utils } from '../../../common/utils';

@Injectable({
    providedIn: 'root'
})
export class ProfileServices {
    private readonly destroyRef = inject(DestroyRef);
    private _user = signal<UserProfileModel | null>(null);
    private _isLoading = signal<boolean>(false);
    private _errorMessage = signal<string | null>(null);

    public readonly userProfile = computed(() => this._user());
    public readonly isLoading = computed(() => this._isLoading());
    public readonly errorMessage = computed(() => this._errorMessage());
    public readonly hasError = computed(() => !!this._errorMessage());

    constructor(
        private readonly authHttpService: AuthHttpService,
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

    public clearError(): void {
        this._errorMessage.set(null);
    }

    public updateProfile(updatedProfile: UserEditProfileModel): Observable<void> {
        return this.authHttpService.updateProfile(updatedProfile).pipe(
            tap(
                (httpResponse) => {
                    this.authService.updateTokensFromResponse(httpResponse);
                }),
            map(() => void 0), // Return void
            catchError((error) => {
                return throwError(() => error);
            })
        );
    }

    public deleteProfile(id: string): Observable<void> {
        return this.authHttpService.deleteProfile(id)
            .pipe(
                tap(() => {
                    this._user.set(null);
                    this._errorMessage.set(null);
                    this._isLoading.set(false);
                    this.authService.logout();
                }),
                map(() => void 0), // Return void
                takeUntilDestroyed(this.destroyRef),
                catchError((error) => {
                    this._errorMessage.set('Неуспешно изтриване на профила');
                    return throwError(() => error);
                })
            );
    }

    private loadUserProfile(id: string): void {
        // Set loading state
        this._isLoading.set(true);
        this._errorMessage.set(null);

        this.authHttpService.getUserProfile(id)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                map(response => response.body!),
                catchError((error) => {
                    return throwError(() => error);
                })
            )
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

    public changePassword(currentPassword: string, newPassword: string): Observable<void> {
        const currentUser = this.authService.currentUser();
        if (!currentUser) {
            const errorMessage = 'Потребителят не е автентифициран';
            this._errorMessage.set(errorMessage);
            return throwError(() => new Error(errorMessage));
        }

        const changePasswordRequest: ChangePasswordModel = {
            currentPassword,
            newPassword
        };

        return this.authHttpService.changePassword(currentUser.id, changePasswordRequest).pipe(
            map(() => void 0), // Return void
            catchError((error) => {
                const errorMessage = Utils.getErrorMessage(error, 'смяна на паролата');
                this._errorMessage.set(errorMessage);
                return throwError(() => new Error(errorMessage));
            })
        );
    }

}