import { Component, OnInit, DestroyRef, signal } from '@angular/core';
import { TherapistsService } from '../services/therapists.service';
import { ToasterService } from '../../../layout';
import { ActivatedRoute, Router } from '@angular/router';
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
    isLoaded = signal(false);
    therapistId = signal<string>('');
    therapistDetails = signal<TherapistDetailsModel>({} as TherapistDetailsModel);

    constructor(
        private readonly therapistsService: TherapistsService,
        private readonly toasterService: ToasterService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly destroyRef: DestroyRef,
        private readonly location: Location
    ) { }

    ngOnInit(): void {
        this.route.params
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(params => {
                const id = params['id'];
                if (id) {
                    this.therapistId.set(id);
                    this.loadTherapistDetails(id);
                } else {
                    this.toasterService.error('Неуспешно зареждане на детайлите за терапевта. Моля, опитайте отново.');
                    this.location.back();
                }
            });
    }

    private loadTherapistDetails(id: string): void {
        this.therapistsService.getTherapist(id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (therapist) => {
                    console.log(therapist);
                    this.therapistDetails.set(therapist);
                    this.isLoaded.set(true);
                },
                error: (error) => {
                    this.toasterService.error('Неуспешно зареждане на детайлите за терапевта. Моля, опитайте отново.');
                    console.log(error);
                }
            });
    }

    goBack(): void {
        this.location.back();
    }

}
