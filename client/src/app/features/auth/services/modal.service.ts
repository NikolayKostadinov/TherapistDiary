import { Injectable, signal } from '@angular/core';

export type ModalType = 'login' | 'register' | 'forgotPassword' | null;

@Injectable({
    providedIn: 'root'
})
export class ModalService {
    private activeModal = signal<ModalType>(null);

    readonly activeModal$ = this.activeModal.asReadonly();

    openLoginModal(): void {
        this.activeModal.set('login');
    }

    openRegisterModal(): void {
        this.activeModal.set('register');
    }

    openForgotPasswordModal(): void {
        this.activeModal.set('forgotPassword');
    }

    closeModal(): void {
        this.activeModal.set(null);
    }

    get isLoginModalOpen(): boolean {
        return this.activeModal() === 'login';
    }

    get isRegisterModalOpen(): boolean {
        return this.activeModal() === 'register';
    }

    get isForgotPasswordModalOpen(): boolean {
        return this.activeModal() === 'forgotPassword';
    }
}
