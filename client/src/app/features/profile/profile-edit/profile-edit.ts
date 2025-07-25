import { Component, signal, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileServices } from '../services/profile.service';
import { UserEditProfileModel } from '../models';
import { ProfileImageUpload } from '../profile-image-upload/profile-image-upload';
import { ToasterService } from '../../../layout/toaster';
import { AuthService } from '../../auth/services';
import { Utils } from '../../../common/utils';
import { ApiError } from '../../../common/models';
import { ApplicationForm } from '../../../common';
import { AuthResponse, UserInfo } from '../../auth';

@Component({
    selector: 'app-profile-edit',
    imports: [CommonModule, ReactiveFormsModule, ProfileImageUpload],
    templateUrl: './profile-edit.html',
    styleUrl: './profile-edit.css'
})
export class ProfileEdit extends ApplicationForm implements OnInit {
    readonly isLoading = signal(false);
    readonly currentUser: Signal<UserInfo | null>;

    constructor(
        private readonly _fb: FormBuilder,
        private readonly authService: AuthService,
        private readonly profileService: ProfileServices,
        private readonly router: Router,
        private readonly _toaster: ToasterService
    ) {
        super(_fb, _toaster);
        this.currentUser = this.authService.currentUser;
        this.form = this.fb.group({
            firstName: ['', [Validators.required]],
            midName: [''],
            lastName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{8,14}$/)]],
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
                    this.router.navigate(['/profile']);
                } catch (error) {
                    this.toaster.error('Възникна грешка при обновяване на профила. Моля, опитайте отново.');
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
