import { Component } from '@angular/core';
import { ProfileServices } from '../services/profile.service';
import { UserProfileModel } from '../models';

@Component({
    selector: 'app-profile-edit',
    imports: [],
    templateUrl: './profile-edit.html',
    styleUrl: './profile-edit.css'
})
export class ProfileEdit {
    toasterService: any;
    constructor(protected readonly profileService: ProfileServices) { }

    // Метод за обновяване на профила
    onUpdateProfile(updatedProfile: UserProfileModel): void {
        this.profileService.updateProfile(updatedProfile).subscribe({
            next: () => {
                this.toasterService.success('Профилът беше успешно обновен');
            },
            error: (error) => {
                this.toasterService.error('Грешка при обновяване на профила!');
                console.error('Грешка при обновяване на профила:', error);
            }
        });
    }
}
