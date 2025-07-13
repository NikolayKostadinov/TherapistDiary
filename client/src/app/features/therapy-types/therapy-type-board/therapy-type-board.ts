import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { TherapyTypeService } from '../services/therapytype.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TherapyTypeListModel } from '../models';
import { Spinner } from "../../../layout/spinner/spinner";
import { TherapyTypeItem } from "../therapy-type-item/therapy-type-item";
import { ToasterService } from '../../../layout/toaster/toaster.service';
import { ScrollAnimationDirective } from '../../../common/directives';

@Component({
    selector: 'app-therapy-type-board',
    imports: [Spinner, TherapyTypeItem, ScrollAnimationDirective],
    templateUrl: './therapy-type-board.html',
    styleUrl: './therapy-type-board.css'
})
export class TherapyTypeBoard implements OnInit {
    therapyTypes = signal<TherapyTypeListModel[]>([]);

    constructor(
        private readonly therapyTypesService: TherapyTypeService,
        private destroyref: DestroyRef,
        private toasterService: ToasterService
    ) { }

    ngOnInit(): void {
        this.therapyTypesService.getTherapyTypes()
            .pipe(takeUntilDestroyed(this.destroyref))
            .subscribe({
                next: (therapyTypes) => {
                    this.therapyTypes.set(therapyTypes);
                },
                error: (error) => {
                    this.toasterService.error('Неуспешно зареждане на видовете терапия. Моля, опитайте отново.');
                    console.log(error);
                }
            });
    }
}

