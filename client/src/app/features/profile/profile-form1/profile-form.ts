import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileImageUploadComponent } from '../profile-image-upload/profile-image-upload.component';

@Component({
    selector: 'app-profile-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ProfileImageUploadComponent],
    templateUrl: './profile-form.html',
    styleUrls: ['./profile-form.css']
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

            console.log('Form submitted with data:', this.profileForm.value);
            console.log('Profile Picture URL:', this.profileForm.value.profilePictureUrl);

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
