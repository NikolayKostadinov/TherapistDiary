import { Component, OnInit, Signal, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileServices } from '../services/profile.service';
import { UserEditProfileModel, UserProfileModel } from '../models';
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
    private readonly authService = inject(AuthService);
    private readonly profileService = inject(ProfileServices);
    private readonly router = inject(Router);


    readonly currentUser: Signal<UserInfo | null>;
    private formInitialized = signal(false);

    constructor() {
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

        effect(() => {
            const profile = this.profileService.userProfile();
            const isLoading = this.profileService.isLoading();

            if (profile && !isLoading && !this.formInitialized()) {
                this.loadUserProfile(profile);
                this.formInitialized.set(true);
            }
        });
    }

    get profilePictureUrl(): string {
        return this.form.get('profilePictureUrl')?.value ?? ''
    }

    get isTherapist(): boolean {
        const user = this.currentUser();
        return user?.roles?.includes('Therapist') ?? false;
    }

    ngOnInit(): void {

        console.log('ProfileEdit component initialized OnInit'); // Debug log

        const profile = this.profileService.userProfile();
        const isLoading = this.profileService.isLoading();

        if (profile && !isLoading && !this.formInitialized()) {
            this.loadUserProfile(profile);
            this.formInitialized.set(true);
        }
    }

    private loadUserProfile(profile: UserProfileModel): void {
        if (profile) {
            console.log('Loading profile data into form:', profile); // Debug log

            this.form.patchValue({
                firstName: profile.firstName || '',
                midName: profile.midName || '',
                lastName: profile.lastName || '',
                email: profile.email || '',
                phoneNumber: profile.phoneNumber || '',
                specialty: profile.specialty || '',
                biography: profile.biography || '',
                profilePictureUrl: profile.profilePictureUrl || ''
            });

            console.log('Form values after patch:', this.form.value); // Debug log
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
            specialty: this.isTherapist ? (formValue.specialty || null) : null,
            biography: this.isTherapist ? (formValue.biography || null) : null,
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
