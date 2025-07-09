import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { TherapyTypeService } from '../services/therapytype.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TherapyTypeListModel } from '../models';
import { Spinner } from "../../../layout/spinner/spinner";
import { TherapyTypeItem } from "../therapy-type-item/therapy-type-item";

@Component({
    selector: 'app-therapy-type-board',
    imports: [Spinner, TherapyTypeItem],
    templateUrl: './therapy-type-board.html',
    styleUrl: './therapy-type-board.css'
})
export class TherapyTypeBoard implements OnInit {
    isLoaded = signal(false);
    therapyTypes = signal<TherapyTypeListModel[]>([]);

    constructor(private readonly therapyTypesService: TherapyTypeService, private destroyref: DestroyRef) { }

    ngOnInit(): void {
        console.log('TherapyTypeBoard ngOnInit called');
        this.therapyTypesService.getTherapyTypes()
            .pipe(takeUntilDestroyed(this.destroyref))
            .subscribe({
                next: (therapyTypes) => {
                    console.log('Therapy types received:', therapyTypes);
                    this.therapyTypes.set(therapyTypes);
                    this.isLoaded.set(true);
                },
                error: (error) => {
                    console.error('Error loading therapy types:', error);
                    this.isLoaded.set(true); // Set to true even on error to hide spinner
                }
            })
    }
}

