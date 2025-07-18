import { Component, OnInit, DestroyRef, signal } from '@angular/core';
import { TherapistsService } from '../services/therapists.service';
import { ToasterService } from '../../../layout';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { TherapistDetailsModel } from '../models/therapist.details.model';
import { ScrollAnimationDirective } from '../../../common/directives';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-therapist-details',
    imports: [ScrollAnimationDirective],
    templateUrl: './therapist-details.html',
    styleUrl: './therapist-details.css'
})
export class TherapistDetails implements OnInit {

    therapistId!: string;

    therapistDetails = signal<TherapistDetailsModel>({} as TherapistDetailsModel);

    constructor(
        private readonly therapistsService: TherapistsService,
        private readonly toasterService: ToasterService,
        private readonly route: ActivatedRoute,
        private readonly DestroyRef: DestroyRef,
        private readonly location: Location
    ) { }


    ngOnInit(): void {
        this.therapistId = this.route.snapshot.params['id'];
        this.therapistsService.getTherapist(this.therapistId)
            .pipe(takeUntilDestroyed(this.DestroyRef))
            .subscribe({
                next: (therapist) => {
                    console.log(therapist);
                    this.therapistDetails.set(therapist);
                },
                error: (error) => {
                    this.toasterService.error('Неуспешно зареждане на детайлите за терапевта. Моля, опитайте отново.');
                    console.log(error);
                }
            })
    }

    goBack(): void {
        this.location.back();
    }

}
