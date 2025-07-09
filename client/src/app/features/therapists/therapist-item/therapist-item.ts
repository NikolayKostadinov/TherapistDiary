import { Component, Input, signal } from '@angular/core';
import { TherapistListModel } from '../models';
import { Spinner } from "../../../layout/spinner/spinner";

@Component({
    selector: 'app-therapist-item',
    imports: [Spinner],
    templateUrl: './therapist-item.html',
    styleUrl: './therapist-item.css'
})
export class TherapistItem {
    @Input("therapist") therapist!: TherapistListModel;
    imageLoaded = signal(false);

    onImageLoad() {
        this.imageLoaded.set(true);
    }

    onImageError() {
        this.imageLoaded.set(true); // Hide spinner even on error
    }
}
