import { Component, signal, Output, EventEmitter, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../models';
import { Utils } from '../../../common/utils';
import { BaseApplicationFormComponent } from '../../../common';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.html',
    styleUrl: './login.css'
})
export class Login extends BaseApplicationFormComponent {
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);

    @Output() modalClosed = new EventEmitter<void>();

    showPassword = signal(false);

    constructor() {
        super();
        this.form = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            password: ['', [Validators.required, Validators.minLength(8)]]
        });
        Utils.setupClearServerErrorsOnValueChange(this.form, this.serverErrors);
    }

    get username() {
        return this.form.get('username');
    }

    get password() {
        return this.form.get('password');
    }

    togglePasswordVisibility() {
        this.showPassword.update(show => !show);
    }

    onSubmit() {
        if (this.form.valid) {
            this.isLoading.set(true);
            this.generalError.set('');

            const loginData: LoginRequest = {
                username: this.form.value.username,
                password: this.form.value.password
            };

            this.authService.login(loginData).subscribe({
                next: (response) => {
                    this.isLoading.set(false);
                    this.closeModal();
                },
                error: (error) => {
                    this.isLoading.set(false);
                    this.processApiErrorResponse(error);
                }
            });
        } else {
            Utils.markFormGroupTouched(this.form);
        }
    }

    closeModal() {
        this.modalClosed.emit();
        this.router.navigate(['/']);
    }

    goToRegister() {
        this.modalClosed.emit();
        this.router.navigate(['/register']);
    }

    @HostListener('document:keydown.escape')
    onEscapeKey() {
        this.closeModal();
    }

    // Предотвратяване на затварянето при клик върху съдържанието на модала
    onModalContentClick(event: Event) {
        event.stopPropagation();
    }
}
