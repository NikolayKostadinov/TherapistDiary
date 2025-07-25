import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services';
import { RegisterRequest } from '../models';
import { ToasterService } from '../../../layout/toaster';
import { ApiErrorResponse, ValidationError } from '../../../common/models';
import { Utils } from '../../../common/utils';
import { ApplicationForm } from '../../../common';

@Component({
    selector: 'app-register',
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './register.html',
    styleUrl: './register.css'
})
export class Register extends ApplicationForm {
    constructor(      
        private readonly authService: AuthService,
        private readonly router: Router,
       ) {
        super();
        this.form = this.fb.group({
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

        Utils.setupClearServerErrorsOnValueChange(this.form, this.serverErrors);
    }

    onSubmit(): void {
        if (this.form.invalid) {
            Utils.markFormGroupTouched(this.form);
            return;
        }

        this.isLoading.set(true);
        this.clearErrors();

        const formValue = this.form.value;
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

        this.authService.register(registerData).subscribe({
            next: () => {
                this.toaster.success('Регистрацията е успешна! Добре дошли!');

                // Check if user is logged in before navigating
                if (this.authService.isLoggedIn()) {
                    this.router.navigate(['/home']);
                } else {
                    this.router.navigate(['/auth/login']);
                }
            },
            error: (error) => {
                const convertedError = error as ApiErrorResponse;
                if (convertedError) {
                    const { serverErrors, generalError } = Utils.handleError(convertedError, this.form);
                    this.serverErrors.set(serverErrors);
                    this.generalError.set(generalError);
                } else {
                    this.toaster.error('Възникна грешка при регистрацията. Моля, опитайте отново.');
                    console.error('Registration error:', error);
                }
            },
            complete: () => {
                this.isLoading.set(false);
            }
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
}


