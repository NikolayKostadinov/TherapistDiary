import { Component, computed, effect, OnInit, Signal } from '@angular/core';
import { ProfileServices } from '..';
import { UserProfileModel } from '../models';
import { ProfileFormDemoComponent } from "../profile-form1/profile-form";
import { Spinner } from "../../../layout";
import { ScrollAnimationDirective } from '../../../common/directives';

@Component({
    selector: 'app-profile',
    imports: [Spinner, ScrollAnimationDirective],
    templateUrl: './profile.html',
    styleUrl: './profile.css'
})
export class Profile implements OnInit {

    userProfile: Signal<UserProfileModel | null>;

    // Signals от сервиза за грешки и loading състояние
    errorMessage: Signal<string | null>;
    isLoading: Signal<boolean>;
    hasError: Signal<boolean>;

    constructor(
        private readonly profileService: ProfileServices
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

    ngOnInit(): void {
        // Component initialization complete
    }

    private handleProfileError(error: string): void {
        // Тук можеш да покажеш notification, toast, и т.н.
        console.error('Грешка при зареждане на профила:', error);

        // Примерно показване на user-friendly съобщение
        // this.notificationService.showError(error);
    }

    // Метод за retry
    onRetryLoadProfile(): void {
        this.profileService.refreshProfile();
    }

    // Метод за изчистване на грешката
    onClearError(): void {
        this.profileService.clearError();
    }
}
