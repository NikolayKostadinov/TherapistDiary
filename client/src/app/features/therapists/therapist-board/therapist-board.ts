import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { TherapistsService } from '../services/therapists.service';
import { TherapistListModel } from '../models/therapist.list.model';
import { CommonModule } from '@angular/common';
import { TherapistItem } from "../therapist-item/therapist-item";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Spinner } from "../../../layout/spinner/spinner";

@Component({
    selector: 'app-therapist-board',
    imports: [CommonModule, TherapistItem, Spinner],
    templateUrl: './therapist-board.html',
    styleUrl: './therapist-board.css'
})

export class TherapistBoard implements OnInit {

    therapists = signal<TherapistListModel[]>([]);
    isLoaded = signal(false);


    constructor(private readonly therapistsService: TherapistsService, private readonly destroyref: DestroyRef) { }

    ngOnInit(): void {
        console.log('TherapistBoard ngOnInit called');
        this.therapistsService.getTherapists()
            .pipe(takeUntilDestroyed(this.destroyref))
            .subscribe({
                next: (therapists) => {
                    console.log('Therapists received:', therapists);
                    this.therapists.set(therapists);
                    this.isLoaded.set(true);
                },
                error: (error) => {
                    console.error('Error loading therapists:', error);
                    this.isLoaded.set(true); // Set to true even on error to hide spinner
                }
            });
    }
}
