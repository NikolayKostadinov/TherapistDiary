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
import { AppointmentTimePipe } from '../appointment-time.pipe';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services';
import { AppointmentService } from "../services/appointment.service";
import { AppointmentCreateModel, AppointmentTimeModel } from "../models";

@Component({
    selector: "app-appointment-create",
    imports: [ReactiveFormsModule, CommonModule, ScrollAnimationDirective, AppointmentTimePipe],
    templateUrl: "./appointment-create.html",
    styleUrl: "./appointment-create.css",
})
export class AppointmentCreate extends ApplicationForm implements OnInit {
    private therapyTypesService = inject(TherapyTypeService);
    private therapistsService = inject(TherapistsService);
    private appointmentService = inject(AppointmentService);
    private destroyref = inject(DestroyRef);
    private toasterService = inject(ToasterService);
    private router = inject(Router);
    private authService = inject(AuthService);

    protected therapyTypes = signal<TherapyTypeListModel[]>([]);
    protected therapies = signal<TherapyListModel[]>([]);
    protected isTherapyTypeSelected = signal<boolean>(false);
    protected isDateSelected = signal<boolean>(false);
    protected therapists = signal<TherapistListModel[]>([]);
    protected availableAppointments = signal<AppointmentTimeModel[]>([]);
    protected isSubmitting = signal<boolean>(false);

    constructor() {
        super();
        this.form = this.fb.group({
            therapyType: ["", [Validators.required]],
            therapy: [{ value: "", disabled: true }, [Validators.required]],
            therapist: [{ value: "", disabled: true }, [Validators.required]],
            date: [{ value: "", disabled: true }, [Validators.required]],
            time: [{ value: "", disabled: true }, [Validators.required]],
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
            .subscribe((therapyId: string) => {
                this.onTherapyChange(therapyId);
            });

        this.form.get('therapist')?.valueChanges
            .pipe(takeUntilDestroyed(this.destroyref))
            .subscribe((therapistId: string) => {
                this.onTherapistChange(therapistId);
            });

        this.form.get('date')?.valueChanges
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
                this.isTherapyTypeSelected.set(true);
                therapyControl?.enable();
            } else {
                therapyControl?.disable();
                this.isTherapyTypeSelected.set(true);
            }
        } else {
            therapyControl?.disable();
            this.isTherapyTypeSelected.set(true);
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
        const dateControl = this.form.get('date');
        if (therapistId) {
            dateControl?.enable();
        } else {
            dateControl?.disable();
        }

        this.loadTherapists();
    }

    onAppointmentDateChange(appointmentDate: Date): void {
        const therapistControl = this.form.get('therapist');
        const dateControl = this.form.get('date');
        const timeControl = this.form.get('time');

        // Изчистваме избраното време при смяна на датата
        timeControl?.setValue('');
        this.availableAppointments.set([]);
        this.isDateSelected.set(false);

        if (appointmentDate && therapistControl && dateControl) {
            const therapistId = therapistControl.value;
            const selectedDate = dateControl.value;

            if (therapistId && selectedDate) {
                this.appointmentService.getAvailableAppointments(therapistId, selectedDate)
                    .pipe(
                        takeUntilDestroyed(this.destroyref)
                    )
                    .subscribe({
                        next: (availableAppointments: AppointmentTimeModel[]) => {
                            this.availableAppointments.set(availableAppointments);
                            this.isDateSelected.set(true);
                            timeControl?.enable();
                        },
                        error: (error) => {
                            this.toasterService.error("Неуспешно зареждане на наличните часове.");
                            timeControl?.disable();
                        }
                    });
            }
        } else {
            timeControl?.disable();
        }
    }

    ngOnInit(): void {
        this.loadTherapyTypes();
    }



    onSubmit(): void {
        if (this.form.invalid) {
            Utils.markFormGroupTouched(this.form);
            this.toasterService.error("Моля, попълнете всички задължителни полета.");
            return;
        }

        this.isSubmitting.set(true);
        this.clearErrors();

        const formValue = this.form.value;

        // Намираме избрания час от наличните часове
        const selectedTimeValue = formValue.time;
        const selectedAppointment = this.availableAppointments().find(apt => apt.start === selectedTimeValue);

        if (!selectedAppointment) {
            this.isSubmitting.set(false);
            this.toasterService.error("Невалиден избор на час. Моля, изберете отново.");
            return;
        }

        const appointmentData: AppointmentCreateModel = {
            patientId: this.authService.currentUser()?.id || '',
            therapistId: formValue.therapist,
            therapyId: formValue.therapy,
            date: formValue.date, // Изпращаме като string във формат YYYY-MM-DD
            start: selectedAppointment.start,
            end: selectedAppointment.end,
            notes: formValue.comment || undefined
        };

        this.appointmentService.createAppointment(appointmentData)
            .pipe(takeUntilDestroyed(this.destroyref))
            .subscribe({
                next: () => {
                    this.isSubmitting.set(false);
                    this.toasterService.success("Часът е запазен успешно!");
                    this.router.navigate(['/my-appointments']); // или към списък с часове
                },
                error: (error) => {
                    this.isSubmitting.set(false);
                    this.processApiErrorResponse(error);
                }
            });
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
