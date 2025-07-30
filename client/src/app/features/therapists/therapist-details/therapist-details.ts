import { Location } from "@angular/common";
import { Component, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { ScrollAnimationDirective } from "../../../common/directives";
import { ToasterService } from "../../../layout";
import { TherapistDetailsModel } from "../models/therapist.details.model";
import { TherapistsService } from "../services/therapists.service";

@Component({
  selector: "app-therapist-details",
  imports: [ScrollAnimationDirective],
  templateUrl: "./therapist-details.html",
  styleUrl: "./therapist-details.css",
})
export class TherapistDetails implements OnInit {
  private readonly therapistsService = inject(TherapistsService);
  private readonly toasterService = inject(ToasterService);
  private readonly route = inject(ActivatedRoute);
  private readonly DestroyRef = inject(DestroyRef);
  private readonly location = inject(Location);

  therapistId!: string;

  therapistDetails = signal<TherapistDetailsModel>({} as TherapistDetailsModel);

  constructor() {}

  ngOnInit(): void {
    this.therapistId = this.route.snapshot.params["id"];
    this.therapistsService
      .getTherapist(this.therapistId)
      .pipe(takeUntilDestroyed(this.DestroyRef))
      .subscribe({
        next: (therapist) => {
          this.therapistDetails.set(therapist);
        },
        error: (error) => {
          this.toasterService.error(
            "Неуспешно зареждане на детайлите за терапевта. Моля, опитайте отново."
          );
        },
      });
  }

  goBack(): void {
    this.location.back();
  }
}
