import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../models';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    loginForm: FormGroup;
    isLoading = signal(false);
    errorMessage = signal('');
    showPassword = signal(false);

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly authService: AuthService
    ) {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    get username() {
        return this.loginForm.get('username');
    }

    get password() {
        return this.loginForm.get('password');
    }

    togglePasswordVisibility() {
        this.showPassword.update(show => !show);
    }

    onSubmit() {
        if (this.loginForm.valid) {
            this.isLoading.set(true);
            this.errorMessage.set('');

            const loginData: LoginRequest = {
                username: this.loginForm.value.username,
                password: this.loginForm.value.password
            };

            this.authService.login(loginData).subscribe({
                next: (response) => {
                    this.isLoading.set(false);
                    this.router.navigate(['/']);
                },
                error: (error: Error) => {
                    this.isLoading.set(false);
                    this.errorMessage.set(error.message);
                }
            });
        } else {
            this.markFormGroupTouched();
        }
    }

    private markFormGroupTouched() {
        Object.keys(this.loginForm.controls).forEach(key => {
            const control = this.loginForm.get(key);
            control?.markAsTouched();
        });
    }
}
