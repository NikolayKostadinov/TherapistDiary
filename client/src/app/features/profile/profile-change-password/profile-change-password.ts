import { Component, OnInit, inject } from '@angular/core';
import { BaseApplicationFormComponent, Utils } from '../../../common';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileServices } from '../services/profile.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-profile-change-password',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './profile-change-password.html',
    styleUrl: './profile-change-password.css'
})
export class ProfileChangePassword extends BaseApplicationFormComponent implements OnInit {
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
            currentPassword: ['', [Validators.required, Validators.minLength(8)]],
            newPassword: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });

        // Setup automatic clearing of server errors when user starts typing
        Utils.setupClearServerErrorsOnValueChange(this.form, this.serverErrors);

        // Clear password mismatch errors when user starts typing
        Utils.setupClearPasswordMismatchError(this.form, 'newPassword', 'confirmPassword');
    }

    private passwordMatchValidator(form: FormGroup) {
        const newPassword = form.get('newPassword');
        const confirmPassword = form.get('confirmPassword');

        if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
            const passwordMatchError = { mismatch: true };
            confirmPassword.setErrors(passwordMatchError);
            return passwordMatchError;
        }

        confirmPassword?.setErrors(null);
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
}
