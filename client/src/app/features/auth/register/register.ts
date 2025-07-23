import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services';
import { RegisterRequest } from '../models';
import { ToasterService } from '../../../layout/toaster';

@Component({
    selector: 'app-register',
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './register.html',
    styleUrl: './register.css'
})
export class Register {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly toaster = inject(ToasterService);

    readonly isLoading = signal(false);

    registerForm: FormGroup;

    constructor() {
        this.registerForm = this.fb.group({
            userName: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            firstName: ['', [Validators.required]],
            midName: [''],
            lastName: ['', [Validators.required]],
            phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{8,14}$/)]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]]
        }, {
            validators: this.passwordMatchValidator
        });
    }

    private passwordMatchValidator(form: FormGroup) {
        const password = form.get('password');
        const confirmPassword = form.get('confirmPassword');

        if (password?.value !== confirmPassword?.value) {
            confirmPassword?.setErrors({ mismatch: true });
            return { mismatch: true };
        }

        confirmPassword?.setErrors(null);
        return null;
    }

    async onSubmit(): Promise<void> {
        if (this.registerForm.invalid) {
            this.markFormGroupTouched();
            return;
        }

        this.isLoading.set(true);

        try {
            const formValue = this.registerForm.value;
            const registerData: RegisterRequest = {
                userName: formValue.userName,
                email: formValue.email,
                firstName: formValue.firstName,
                midName: formValue.midName || null,
                lastName: formValue.lastName,
                phoneNumber: formValue.phoneNumber,
                password: formValue.password,
                confirmPassword: formValue.confirmPassword
            };

            await firstValueFrom(this.authService.register(registerData));

            this.toaster.success('Регистрацията е успешна! Добре дошли!');

            // Check if user is logged in before navigating
            if (this.authService.isLoggedIn()) {
                await this.router.navigate(['/home']);
            } else {
                await this.router.navigate(['/auth/login']);
            }

        } catch (error: any) {
            this.toaster.error(error.message || 'Грешка при регистрация');
        } finally {
            this.isLoading.set(false);
        }
    }

    private markFormGroupTouched(): void {
        Object.keys(this.registerForm.controls).forEach(key => {
            const control = this.registerForm.get(key);
            control?.markAsTouched();
        });
    }

    getFieldError(fieldName: string): string {
        const field = this.registerForm.get(fieldName);

        if (field?.errors && field.touched) {
            if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} е задължително поле`;
            if (field.errors['email']) return 'Невалиден email адрес';
            if (field.errors['minlength']) return `${this.getFieldDisplayName(fieldName)} трябва да съдържа поне ${field.errors['minlength'].requiredLength} символа`;
            if (field.errors['pattern']) return 'Невалиден формат на телефонен номер';
            if (field.errors['mismatch']) return 'Паролите не съвпадат';
        }

        return '';
    }

    private getFieldDisplayName(fieldName: string): string {
        const displayNames: { [key: string]: string } = {
            userName: 'Потребителско име',
            email: 'Email',
            firstName: 'Име',
            lastName: 'Фамилия',
            phoneNumber: 'Телефон',
            password: 'Парола',
            confirmPassword: 'Потвърди парола'
        };
        return displayNames[fieldName] || fieldName;
    }
}
