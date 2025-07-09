import { Component, Input, signal } from '@angular/core';
import { TherapistListModel } from '../models/therapist.list.model';

@Component({
    selector: 'app-therapist-item',
    imports: [],
    templateUrl: './therapist-item.html',
    styleUrl: './therapist-item.css'
})
export class TherapistItem {
    @Input("therapist") therapist!: TherapistListModel;
}
