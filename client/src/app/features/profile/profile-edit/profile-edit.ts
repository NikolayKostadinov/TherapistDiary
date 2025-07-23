import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProfileServices } from '../services/profile.service';
import { UserEditProfileModel, UserProfileModel } from '../models';
import { ProfileImageUpload } from '../profile-image-upload/profile-image-upload';
import { ToasterService } from '../../../layout/toaster';
import { AuthService } from '../../auth/services';

@Component({
    selector: 'app-profile-edit',
    imports: [CommonModule, ReactiveFormsModule, ProfileImageUpload],
    templateUrl: './profile-edit.html',
    styleUrl: './profile-edit.css'
})
export class ProfileEdit implements OnInit {
    readonly isLoading = signal(false);
    readonly currentUser;

    profileEditForm: FormGroup;

    constructor(
        private readonly fb: FormBuilder,
        private readonly profileService: ProfileServices,
        private readonly toasterService: ToasterService,
        private readonly router: Router,
        private readonly authService: AuthService
    ) {

        this.currentUser = this.authService.currentUser;
        this.profileEditForm = this.fb.group({
            firstName: ['', [Validators.required]],
            midName: [''],
            lastName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{8,14}$/)]],
            specialty: [''],
            biography: [''],
            profilePictureUrl: ['']
        });
    }

    ngOnInit(): void {
        this.loadUserProfile();
    }

    private async loadUserProfile(): Promise<void> {
        // Load profile from ProfileService instead of AuthService
        this.profileService.refreshProfile();
        const profile = this.profileService.userProfile();

        if (profile) {
            this.profileEditForm.patchValue({
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

    async onSubmit(): Promise<void> {
        if (this.profileEditForm.invalid) {
            this.markFormGroupTouched();
            return;
        }

        try {
            const formValue = this.profileEditForm.value;
            const editProfile: UserEditProfileModel = {
                id: this.currentUser()?.id || '',
                email: formValue.email,
                firstName: formValue.firstName,
                midName: formValue.midName || null,
                lastName: formValue.lastName,
                fullName: `${formValue.firstName} ${formValue.lastName}`,
                phoneNumber: formValue.phoneNumber,
                specialty: formValue.specialty || null,
                biography: formValue.biography || null,
                profilePictureUrl: formValue.profilePictureUrl || null
            };

            await firstValueFrom(this.profileService.updateProfile(editProfile));

            this.authService.logout();
            this.router.navigate(['/login']);
            this.toasterService.success('Профилът е обновен успешно!\n\nВлезте отново, за да видите промените.');

        } catch (error) {
            this.toasterService.error('Грешка при обновяване на профила. Опитайте отново.');
        } finally {
            this.isLoading.set(false);
        }
    }

    onCancel(): void {
        this.router.navigate(['/profile']);
    }

    private markFormGroupTouched(): void {
        Object.keys(this.profileEditForm.controls).forEach(key => {
            const control = this.profileEditForm.get(key);
            control?.markAsTouched();
        });
    }

    getFieldError(fieldName: string): string | null {
        const field = this.profileEditForm.get(fieldName);

        if (field?.errors && field.touched) {
            if (field.errors['required']) {
                return `${this.getFieldDisplayName(fieldName)} е задължително поле`;
            }
            if (field.errors['email']) {
                return 'Въведете валиден email адрес';
            }
            if (field.errors['minlength']) {
                return `${this.getFieldDisplayName(fieldName)} трябва да бъде поне ${field.errors['minlength'].requiredLength} символа`;
            }
            if (field.errors['pattern']) {
                if (fieldName === 'phoneNumber') {
                    return 'Въведете валиден телефонен номер';
                }
            }
        }

        return null;
    }

    private getFieldDisplayName(fieldName: string): string {
        const displayNames: Record<string, string> = {
            firstName: 'Име',
            lastName: 'Фамилия',
            userName: 'Потребителско име',
            email: 'Email адрес',
            phoneNumber: 'Телефонен номер'
        };
        return displayNames[fieldName] || fieldName;
    }
}
