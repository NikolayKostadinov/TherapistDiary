import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from './features/auth/services/modal.service';

@Component({
    selector: 'app-demo',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-6 text-center">
                    <h2 class="mb-4">Modal Demo</h2>
                    
                    <div class="d-grid gap-2">
                        <button 
                            class="btn btn-primary btn-lg"
                            (click)="modalService.openLoginModal()">
                            <i class="fas fa-sign-in-alt me-2"></i>
                            Отвори Login Modal
                        </button>
                        
                        <button 
                            class="btn btn-outline-primary btn-lg"
                            (click)="modalService.openRegisterModal()">
                            <i class="fas fa-user-plus me-2"></i>
                            Отвори Register Modal (TODO)
                        </button>
                        
                        <button 
                            class="btn btn-outline-secondary btn-lg"
                            (click)="modalService.openForgotPasswordModal()">
                            <i class="fas fa-key me-2"></i>
                            Отвори Forgot Password Modal (TODO)
                        </button>
                        
                        <button 
                            class="btn btn-outline-danger btn-lg"
                            (click)="modalService.closeModal()">
                            <i class="fas fa-times me-2"></i>
                            Затвори Modal
                        </button>
                    </div>
                    
                    <div class="mt-4">
                        <p class="text-muted">
                            Current modal: <strong>{{ modalService.activeModal$() || 'None' }}</strong>
                        </p>
                        <p class="small text-info">
                            Login modal open: {{ modalService.isLoginModalOpen }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .container {
            min-height: 100vh;
            display: flex;
            align-items: center;
        }
        
        .btn {
            border-radius: 0.5rem;
            padding: 0.75rem 1.5rem;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
    `]
})
export class DemoComponent {
    constructor(public modalService: ModalService) { }
}
