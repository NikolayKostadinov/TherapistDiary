import { Component, signal, inject, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FirebaseService } from '../../../common/firebase/firebase.service';
import { ToasterService } from '../../../layout';

@Component({
    selector: 'app-profile-image-upload',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './profile-image-upload.component.html',
    styleUrls: ['./profile-image-upload.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ProfileImageUploadComponent),
            multi: true
        }
    ]
})
export class ProfileImageUploadComponent implements ControlValueAccessor {
    @Input() userId!: string;
    @Input() currentImageUrl?: string;

    private firebaseService = inject(FirebaseService);
    private toasterService = inject(ToasterService);

    isUploading = signal(false);
    imageUrl = signal<string | null>(null);
    selectedFile = signal<File | null>(null);
    previewUrl = signal<string | null>(null);
    isDisabled = signal(false);

    // ControlValueAccessor properties
    private onChange = (value: string | null) => { };
    private onTouched = () => { };

    ngOnInit() {
        if (this.currentImageUrl) {
            this.imageUrl.set(this.currentImageUrl);
        }
    }

    onFileSelected(event: Event) {
        if (this.isDisabled()) return;

        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.toasterService.error('Моля, изберете изображение файл.');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.toasterService.error('Файлът е твърде голям. Максимум 5MB.');
                return;
            }

            this.selectedFile.set(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                this.previewUrl.set(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    uploadImage() {
        if (this.isDisabled()) return;

        const file = this.selectedFile();

        if (!file || !this.userId) {
            this.toasterService.error('Няма избран файл или потребител.');
            return;
        }

        this.isUploading.set(true);

        this.firebaseService.uploadProfileImage(file, this.userId).subscribe({
            next: (downloadUrl) => {
                this.imageUrl.set(downloadUrl);
                this.previewUrl.set(null);
                this.selectedFile.set(null);
                this.isUploading.set(false);
                this.toasterService.success('Профилната снимка е качена успешно!');

                // Notify form control of value change
                this.onChange(downloadUrl);
                this.onTouched();

                // Reset file input
                const fileInput = document.getElementById('fileInput') as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = '';
                }
            },
            error: (error) => {
                console.error('Грешка при качване:', error);
                this.isUploading.set(false);
                this.toasterService.error('Грешка при качване на снимката. Опитайте отново.');
            }
        });
    }

    cancelUpload() {
        if (this.isDisabled()) return;

        this.selectedFile.set(null);
        this.previewUrl.set(null);

        // Reset file input
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    removeImage() {
        if (this.isDisabled()) return;

        this.imageUrl.set(null);
        this.onChange(null);
        this.onTouched();
        this.toasterService.success('Профилната снимка е премахната.');
    }

    // ControlValueAccessor methods
    writeValue(value: string | null): void {
        this.imageUrl.set(value);
    }

    registerOnChange(fn: (value: string | null) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled.set(isDisabled);
    }
}
