import { Component, OnInit, inject } from '@angular/core';
import { ApplicationForm } from '../../../common';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileServices } from '../services/profile.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-profile-change-password',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './profile-change-password.html',
    styleUrl: './profile-change-password.css'
})
export class ProfileChangePassword extends ApplicationForm implements OnInit {
    private readonly profileService = inject(ProfileServices);
    private readonly router = inject(Router);

    showCurrentPassword = false;
    showNewPassword = false;
    showConfirmPassword = false;

    constructor() {
        super();
    }

    ngOnInit(): void {
        this.initializeForm();
    }

    private initializeForm(): void {
        this.form = this.fb.group({
            currentPassword: ['', [Validators.required, Validators.minLength(6)]],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
    }

    private passwordMatchValidator(form: any) {
        const newPassword = form.get('newPassword');
        const confirmPassword = form.get('confirmPassword');

        if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
            confirmPassword.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        }

        if (confirmPassword?.hasError('passwordMismatch')) {
            confirmPassword.setErrors(null);
        }

        return null;
    }

    togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
        switch (field) {
            case 'current':
                this.showCurrentPassword = !this.showCurrentPassword;
                break;
            case 'new':
                this.showNewPassword = !this.showNewPassword;
                break;
            case 'confirm':
                this.showConfirmPassword = !this.showConfirmPassword;
                break;
        }
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.clearErrors();
        this.isLoading.set(true);

        const { currentPassword, newPassword } = this.form.value;

        this.profileService.changePassword(currentPassword, newPassword).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.toaster.success('Паролата е сменена успешно');
                this.form.reset();
                this.router.navigate(['/profile']);
            },
            error: (error) => {
                this.isLoading.set(false);
                this.processApiErrorResponse(error);
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/profile']);
    }

    // Helper methods for template
    override getFieldError(fieldName: string): string {
        const field = this.form.get(fieldName);
        if (field?.errors && field.touched) {
            if (field.errors['required']) {
                return `${this.getFieldDisplayName(fieldName)} е задължително поле`;
            }
            if (field.errors['minlength']) {
                return `${this.getFieldDisplayName(fieldName)} трябва да е поне ${field.errors['minlength'].requiredLength} символа`;
            }
            if (field.errors['passwordMismatch']) {
                return 'Паролите не съвпадат';
            }
        }
        return '';
    } private getFieldDisplayName(fieldName: string): string {
        const displayNames: { [key: string]: string } = {
            currentPassword: 'Текущата парола',
            newPassword: 'Новата парола',
            confirmPassword: 'Потвърждението на паролата'
        };
        return displayNames[fieldName] || fieldName;
    }

    hasFieldError(fieldName: string): boolean {
        const field = this.form.get(fieldName);
        return !!(field?.errors && field.touched);
    }
}
