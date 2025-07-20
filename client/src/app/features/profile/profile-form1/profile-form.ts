import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileImageUploadComponent } from '../profile-image-upload/profile-image-upload.component';

@Component({
    selector: 'app-profile-form-demo',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ProfileImageUploadComponent],
    template: `
        <div class="container mt-4">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card shadow-sm">
                        <div class="card-header bg-primary text-white">
                            <h4 class="mb-0">
                                <i class="fas fa-user-edit me-2"></i>
                                Профил - Форма Demo
                            </h4>
                        </div>
                        <div class="card-body">
                            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
                                <!-- Basic Profile Info -->
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Име:</label>
                                            <input 
                                                type="text" 
                                                class="form-control" 
                                                formControlName="firstName"
                                                [class.is-invalid]="firstName?.invalid && firstName?.touched">
                                            @if (firstName?.invalid && firstName?.touched) {
                                                <div class="invalid-feedback">
                                                    Името е задължително
                                                </div>
                                            }
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Фамилия:</label>
                                            <input 
                                                type="text" 
                                                class="form-control" 
                                                formControlName="lastName"
                                                [class.is-invalid]="lastName?.invalid && lastName?.touched">
                                            @if (lastName?.invalid && lastName?.touched) {
                                                <div class="invalid-feedback">
                                                    Фамилията е задължителна
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Email:</label>
                                    <input 
                                        type="email" 
                                        class="form-control" 
                                        formControlName="email"
                                        [class.is-invalid]="email?.invalid && email?.touched">
                                    @if (email?.invalid && email?.touched) {
                                        <div class="invalid-feedback">
                                            Въведете валиден email
                                        </div>
                                    }
                                </div>

                                <!-- Profile Image Upload -->
                                <div class="mb-4">
                                    <label class="form-label">Профилна снимка:</label>
                                    <app-profile-image-upload 
                                        formControlName="profilePictureUrl"
                                        [userId]="userId()">
                                    </app-profile-image-upload>
                                </div>

                                <!-- Form Actions -->
                                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button 
                                        type="button" 
                                        class="btn btn-secondary me-md-2"
                                        (click)="resetForm()">
                                        <i class="fas fa-undo me-2"></i>
                                        Нулиране
                                    </button>
                                    <button 
                                        type="submit" 
                                        class="btn btn-primary"
                                        [disabled]="profileForm.invalid || isSubmitting()">
                                        @if (isSubmitting()) {
                                            <span class="spinner-border spinner-border-sm me-2"></span>
                                        } @else {
                                            <i class="fas fa-save me-2"></i>
                                        }
                                        Запази
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    <!-- Form Value Display -->
                    <div class="card mt-3">
                        <div class="card-body">
                            <h5>Form Value (Real-time):</h5>
                            <pre class="bg-light p-3 rounded">{{ getFormValue() | json }}</pre>
                            
                            <h5 class="mt-3">Profile Picture URL:</h5>
                            <div class="alert alert-info">
                                <strong>this.profileForm.value.profilePictureUrl:</strong>
                                <br>
                                <code>{{ profileForm.value.profilePictureUrl || 'null' }}</code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .card {
            border: none;
            border-radius: 1rem;
        }
        
        .card-header {
            border-radius: 1rem 1rem 0 0 !important;
            border-bottom: none;
            padding: 1.5rem;
        }
        
        .card-body {
            padding: 2rem;
        }

        pre {
            max-height: 300px;
            overflow-y: auto;
            font-size: 0.875rem;
        }

        .alert {
            word-break: break-all;
        }
    `]
})
export class ProfileFormDemoComponent {
    userId = signal('demo-user-form-123');
    isSubmitting = signal(false);

    profileForm: FormGroup;

    constructor(private fb: FormBuilder) {
        this.profileForm = this.fb.group({
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            profilePictureUrl: [null] // This will be managed by ProfileImageUploadComponent
        });
    }

    get firstName() {
        return this.profileForm.get('firstName');
    }

    get lastName() {
        return this.profileForm.get('lastName');
    }

    get email() {
        return this.profileForm.get('email');
    }

    onSubmit() {
        if (this.profileForm.valid) {
            this.isSubmitting.set(true);

            console.log('Формата е изпратена с данни:', this.profileForm.value);
            console.log('URL на профилната снимка:', this.profileForm.value.profilePictureUrl);

            // Simulate API call
            setTimeout(() => {
                this.isSubmitting.set(false);
                alert('Профилът е запазен успешно!\n\nProfile Picture URL: ' +
                    (this.profileForm.value.profilePictureUrl || 'Няма качена снимка'));
            }, 2000);
        } else {
            this.markFormGroupTouched();
        }
    }

    resetForm() {
        this.profileForm.reset();
    }

    getFormValue() {
        return this.profileForm.value;
    }

    private markFormGroupTouched() {
        Object.keys(this.profileForm.controls).forEach(key => {
            const control = this.profileForm.get(key);
            control?.markAsTouched();
        });
    }
}
