import { Component, Input } from '@angular/core';
import { TherapistListModel } from '../models/therapist.list.model';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-therapist-item',
    imports: [RouterLink],
    templateUrl: './therapist-item.html',
    styleUrl: './therapist-item.css'
})
export class TherapistItem {
    @Input("therapist") therapist!: TherapistListModel;
}
