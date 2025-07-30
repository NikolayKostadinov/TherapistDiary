import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, OnInit, signal, Signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from "@angular/forms";
import { ApplicationForm, ScrollAnimationDirective, Utils } from "../../../common";
import { TherapyTypeService } from "../../therapy-types/services/therapytype.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { TherapyTypeListModel } from "../../therapy-types/models";
import { ToasterService } from "../../../layout";
import { TherapistsService } from '../../therapists/services/therapists.service';
import { TherapistListModel } from '../../therapists/models/therapist.list.model';
import { TherapyListModel } from '../../therapy-types/models/therapy.list.model';

@Component({
  selector: "app-appointment-create",
  imports: [ReactiveFormsModule, CommonModule, ScrollAnimationDirective],
  templateUrl: "./appointment-create.html",
  styleUrl: "./appointment-create.css",
})
export class AppointmentCreate extends ApplicationForm implements OnInit {
  private therapyTypesService = inject(TherapyTypeService);
  private therapistsService = inject(TherapistsService);
  private destroyref = inject(DestroyRef);
  private toasterService = inject(ToasterService);

  protected therapyTypes = signal<TherapyTypeListModel[]>([]);
  protected therapies = signal<TherapyListModel[]>([]);
  protected isSelectedTherapyType = signal<boolean>(false);
  protected therapists = signal<TherapistListModel[]>([]);

  constructor() {
    super();
    this.form = this.fb.group({
      therapyType: ["", [Validators.required]],
      therapy: [{ value: "", disabled: true }, [Validators.required]],
      therapist: [{ value: "", disabled: true }, [Validators.required]],
      appointmentDate: [{ value: "", disabled: true }, [Validators.required]],
      appointmentTime: [{value:"", disabled: true}, [Validators.required]],
      comment: ["", [Validators.maxLength(500)]],
    });
    Utils.setupClearServerErrorsOnValueChange(this.form, this.serverErrors);
    this.attachEventHandlers();
  }

  private attachEventHandlers() {
    this.form.get('therapyType')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyref))
      .subscribe(therapyTypeId => {
        this.onTherapyTypeChange(therapyTypeId);
      });

    this.form.get('therapy')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyref))
      .subscribe((therapyId:string) => {
        this.onTherapyChange(therapyId);
      }); 
      
    this.form.get('therapist')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyref))
      .subscribe((therapistId:string) => {
        this.onTherapistChange(therapistId);
      });

      this.form.get('appointmentDate')?.valueChanges
        .pipe(takeUntilDestroyed(this.destroyref))
        .subscribe(appointmentDate => {
          this.onAppointmentDateChange(appointmentDate);
        });
  }

  private onTherapyTypeChange(therapyTypeId: string) {
    const therapyControl = this.form.get('therapy');
    therapyControl?.setValue('');

    if (therapyTypeId) {
      const selectedType = this.therapyTypes().find(tt => tt.id === therapyTypeId);
      if (selectedType && selectedType.therapies) {
        this.therapies.set(selectedType.therapies);
        this.isSelectedTherapyType.set(true);
        therapyControl?.enable();
      } else {
        therapyControl?.disable();
        this.isSelectedTherapyType.set(true);
      }
    } else {
      therapyControl?.disable();
      this.isSelectedTherapyType.set(true);
    }
  }

  private onTherapyChange(therapyId: string): void {
    const therapistControl = this.form.get('therapist');

    if (therapyId) {
      therapistControl?.enable();
    } else {
      therapistControl?.disable();
    }

    this.loadTherapists();
  }
  
  private onTherapistChange(therapistId: string): void {
    const appointmentDateControl = this.form.get('appointmentDate');
    if (therapistId) {
      appointmentDateControl?.enable();
    } else {
      appointmentDateControl?.disable();
    }

    this.loadTherapists();
  }


  onAppointmentDateChange(appointmentDate: Date): void {
    const appointmentTimeControl = this.form.get('appointmentTime');
    if (appointmentDate) {
      appointmentTimeControl?.enable();
    } else {
      appointmentTimeControl?.disable();
    }
  }

  ngOnInit(): void {
    this.loadTherapyTypes();
  }



  onSubmit(): void { }

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

  private loadTherapists() {
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
