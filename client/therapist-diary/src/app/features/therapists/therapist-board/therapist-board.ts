import { Component, DestroyRef, OnInit } from '@angular/core';
import { therapistsUrl } from '../../../common/constants';
import { TherapistsService } from '../services/therapists.service';
import { TherapistListModel } from '../models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-therapist-board',
    imports: [CommonModule],
    templateUrl: './therapist-board.html',
    styleUrl: './therapist-board.css'
})

export class TherapistBoard implements OnInit {

    therapists$: Observable<TherapistListModel[]>;


    constructor(private readonly therapistsService: TherapistsService) {
        this.therapists$ = therapistsService.getTherapists();

    }

    ngOnInit(): void {
    }
}
