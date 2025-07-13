import { Component, DestroyRef, Input, OnInit, signal } from '@angular/core';
import { TherapistsService } from '../therapists.service';
import { TherapistListModel } from '../models/therapist.list.model';
import { CommonModule } from '@angular/common';
import { TherapistItem } from "../therapist-item/therapist-item";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Spinner } from "../../../layout/spinner/spinner";
import { ToasterService } from '../../../layout/toaster/toaster.service';
import { ScrollAnimationDirective } from '../../../common/directives';

@Component({
    selector: 'app-therapist-board',
    imports: [CommonModule, TherapistItem, Spinner, ScrollAnimationDirective],
    templateUrl: './therapist-board.html',
    styleUrl: './therapist-board.css'
})

export class TherapistBoard implements OnInit {

    @Input('is-home') isHome: boolean = false;
    therapists = signal<TherapistListModel[]>([]);

    constructor(
        private readonly therapistsService: TherapistsService,
        private readonly destroyref: DestroyRef,
        private toasterService: ToasterService
    ) { }

    ngOnInit(): void {
        this.therapistsService.getAllTherapists()
            .pipe(takeUntilDestroyed(this.destroyref))
            .subscribe({
                next: (therapists) => {
                    this.therapists.set(therapists);
                },
                error: (error) => {
                    this.toasterService.error('Неуспешно зареждане на терапевтите. Моля, опитайте отново.');
                    console.log(error);
                }
            });
    }
}
