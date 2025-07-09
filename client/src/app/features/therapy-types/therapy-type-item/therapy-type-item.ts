import { Component, Input, signal } from '@angular/core';
import { therapyTypesUrl } from '../../../common/constants';
import { TherapyTypeListModel } from '../models';
import { Spinner } from "../../../layout/spinner/spinner";

@Component({
    selector: 'app-therapy-type-item',
    imports: [Spinner],
    templateUrl: './therapy-type-item.html',
    styleUrl: './therapy-type-item.css'
})
export class TherapyTypeItem {
    @Input('therapy-type') therapyType!: TherapyTypeListModel;
    imageLoaded = signal(false);

    onImageLoad() {
        this.imageLoaded.set(true);
    }

    onImageError() {
        this.imageLoaded.set(true); // Hide spinner even on error
    }
}
