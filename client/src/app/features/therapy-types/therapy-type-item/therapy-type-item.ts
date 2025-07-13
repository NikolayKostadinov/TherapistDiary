import { Component, Input, signal, OnInit } from '@angular/core';
import { therapyTypesUrl } from '../../../common/constants';
import { TherapyTypeListModel } from '../models';
import { Spinner } from "../../../layout/spinner/spinner";

@Component({
    selector: 'app-therapy-type-item',
    imports: [],
    templateUrl: './therapy-type-item.html',
    styleUrl: './therapy-type-item.css'
})
export class TherapyTypeItem {
    @Input({ alias: 'therapy-type' }) therapyType!: TherapyTypeListModel;
}
