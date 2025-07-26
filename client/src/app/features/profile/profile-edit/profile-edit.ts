import { Component, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileServices } from '../services/profile.service';
import { UserEditProfileModel } from '../models';
import { ProfileImageUpload } from '../profile-image-upload/profile-image-upload';
import { AuthService } from '../../auth/services';
import { Utils } from '../../../common/utils';
import { ApiError } from '../../../common/models';
import { ApplicationForm, VALIDATION_PATTERNS } from '../../../common';
import { UserInfo } from '../../auth';

@Component({
    selector: 'app-profile-edit',
    imports: [CommonModule, ReactiveFormsModule, ProfileImageUpload],
    templateUrl: './profile-edit.html',
    styleUrl: './profile-edit.css'
})
export class ProfileEdit extends ApplicationForm implements OnInit {

    readonly currentUser: Signal<UserInfo | null>;

    constructor(
        private readonly authService: AuthService,
        private readonly profileService: ProfileServices,
        private readonly router: Router
    ) {
        super();
        this.currentUser = this.authService.currentUser;
        this.form = this.fb.group({
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            midName: [''],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', [Validators.required, Validators.pattern(VALIDATION_PATTERNS.PHONE_NUMBER)]],
            specialty: [''],
            biography: [''],
            profilePictureUrl: ['']
        });

        Utils.setupClearServerErrorsOnValueChange(this.form, this.serverErrors);
    }

    get profilePictureUrl(): string {
        return this.form.get('profilePictureUrl')?.value ?? ''
    }

    ngOnInit(): void {
        this.loadUserProfile();
    }

    private loadUserProfile(): void {
        const profile = this.profileService.userProfile();

        if (profile) {
            this.form.patchValue({
                firstName: profile.firstName,
                midName: profile.midName,
                lastName: profile.lastName,
                email: profile.email,
                phoneNumber: profile.phoneNumber,
                specialty: profile.specialty,
                biography: profile.biography,
                profilePictureUrl: profile.profilePictureUrl
            });
        }
    }

    onSubmit(): void {
        if (this.form.invalid) {
            Utils.markFormGroupTouched(this.form);
            return;
        }

        this.isLoading.set(true);

        const formValue = this.form.value;
        const editProfile: UserEditProfileModel = {
            id: this.currentUser()?.id || '',
            email: formValue.email,
            firstName: formValue.firstName,
            midName: formValue.midName || null,
            lastName: formValue.lastName,
            phoneNumber: formValue.phoneNumber,
            specialty: formValue.specialty || null,
            biography: formValue.biography || null,
            profilePictureUrl: formValue.profilePictureUrl || null
        };

        this.profileService.updateProfile(editProfile).subscribe({
            next: () => {
                try {
                    this.toaster.success('Профилът е обновен успешно!');
                    this.isLoading.set(false);
                    this.router.navigate(['/profile']);
                } catch (error) {
                    this.toaster.error('Възникна грешка при обновяване на профила. Моля, опитайте отново.');
                    this.isLoading.set(false);
                    this.authService.logout();
                    this.router.navigate(['/login']);
                }
            },
            error: (error: ApiError) => {
                this.processApiErrorResponse(error);
            },
            complete: () => {
                this.isLoading.set(false);
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/profile']);
    }
}
