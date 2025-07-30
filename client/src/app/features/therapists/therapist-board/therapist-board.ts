import { CommonModule } from "@angular/common";
import {
  Component,
  DestroyRef,
  inject,
  Input,
  OnInit,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ScrollAnimationDirective } from "../../../common/directives";
import { Spinner } from "../../../layout/spinner/spinner";
import { ToasterService } from "../../../layout/toaster/toaster.service";
import { TherapistListModel } from "../models/therapist.list.model";
import { TherapistsService } from "../services/therapists.service";
import { TherapistItem } from "../therapist-item/therapist-item";

@Component({
  selector: "app-therapist-board",
  imports: [CommonModule, TherapistItem, Spinner, ScrollAnimationDirective],
  templateUrl: "./therapist-board.html",
  styleUrl: "./therapist-board.css",
})
export class TherapistBoard implements OnInit {
  private readonly therapistsService = inject(TherapistsService);
  private readonly destroyref = inject(DestroyRef);
  private toasterService = inject(ToasterService);

  @Input("is-home") isHome: boolean = false;
  therapists = signal<TherapistListModel[]>([]);

  constructor() {}

  ngOnInit(): void {
    this.therapistsService
      .getAllTherapists()
      .pipe(takeUntilDestroyed(this.destroyref))
      .subscribe({
        next: (therapists) => {
          this.therapists.set(therapists);
        },
        error: (error) => {
          this.toasterService.error(
            "Неуспешно зареждане на терапевтите. Моля, опитайте отново."
          );
        },
      });
  }
}
