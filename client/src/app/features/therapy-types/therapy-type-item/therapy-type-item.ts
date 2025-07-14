import { Component, Input } from '@angular/core';
import { TherapyTypeListModel } from '../models';

@Component({
    selector: 'app-therapy-type-item',
    imports: [],
    templateUrl: './therapy-type-item.html',
    styleUrl: './therapy-type-item.css'
})
export class TherapyTypeItem {
    @Input({ alias: 'therapy-type' }) therapyType!: TherapyTypeListModel;
}
