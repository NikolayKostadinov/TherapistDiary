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
import { TherapyTypeListModel } from "../models";
import { TherapyTypeService } from "../services/therapytype.service";
import { TherapyTypeItem } from "../therapy-type-item/therapy-type-item";

@Component({
  selector: "app-therapy-type-board",
  imports: [Spinner, TherapyTypeItem, ScrollAnimationDirective],
  templateUrl: "./therapy-type-board.html",
  styleUrl: "./therapy-type-board.css",
})
export class TherapyTypeBoard implements OnInit {
  private therapyTypesService = inject(TherapyTypeService);
  private destroyref = inject(DestroyRef);
  private toasterService = inject(ToasterService);

  therapyTypes = signal<TherapyTypeListModel[]>([]);
  @Input("is-home") isHome: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.loadTherapyTypes();
  }

  private loadTherapyTypes() {
    this.therapyTypesService
      .getTherapyTypes()
      .pipe(takeUntilDestroyed(this.destroyref))
      .subscribe({
        next: (therapyTypes) => {
          this.therapyTypes.set(therapyTypes);
        },
        error: (error) => {
          this.toasterService.error(
            "Неуспешно зареждане на видовете терапия. Моля, опитайте отново."
          );
        },
      });
  }
}
