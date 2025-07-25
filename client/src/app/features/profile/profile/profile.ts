import { Component, computed, effect, OnInit, Signal, signal } from '@angular/core';
import { ProfileServices } from '..';
import { UserProfileModel } from '../models';
import { Spinner, ToasterService } from "../../../layout";
import { ScrollAnimationDirective } from '../../../common/directives';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationModal } from '../../../common/components';

@Component({
    selector: 'app-profile',
    imports: [Spinner, ScrollAnimationDirective, RouterLink, ConfirmationModal],
    templateUrl: './profile.html',
    styleUrl: './profile.css'
})
export class Profile {

    userProfile: Signal<UserProfileModel | null>;

    // Signals от сервиза за грешки и loading състояние
    errorMessage: Signal<string | null>;
    isLoading: Signal<boolean>;
    hasError: Signal<boolean>;

    // Signal за показване на модала за потвърждение
    readonly showDeleteModal = signal(false);

    constructor(
        private readonly profileService: ProfileServices,
        private readonly toasterService: ToasterService,
        private readonly router: Router
    ) {
        this.userProfile = this.profileService.userProfile;
        this.errorMessage = this.profileService.errorMessage;
        this.isLoading = this.profileService.isLoading;
        this.hasError = this.profileService.hasError;

        // Наблюдаваме за промени в профила и грешките
        effect(() => {
            const error = this.errorMessage();
            if (error) {
                this.handleProfileError(error);
            }
        });
    }

    private handleProfileError(error: string): void {
        this.toasterService.error('Грешка при зареждане на профила!');
    }

    // Метод за изчистване на грешката
    onClearError(): void {
        this.profileService.clearError();
    }

    onDeleteClick(): void {
        this.showDeleteModal.set(true);
    }

    onConfirmDelete(): void {
        this.showDeleteModal.set(false);
        const userId = this.userProfile()?.id;
        if (userId) {
            this.profileService.deleteProfile(userId).subscribe({
                next: () => {
                    this.toasterService.success('Профилът беше успешно изтрит');
                    this.router.navigate(['/']);
                },
                error: (error) => {
                    this.toasterService.error('Грешка при изтриване на профила:', error);
                }
            });
        }
    }

    onCancelDelete(): void {
        this.showDeleteModal.set(false);
    }
}
