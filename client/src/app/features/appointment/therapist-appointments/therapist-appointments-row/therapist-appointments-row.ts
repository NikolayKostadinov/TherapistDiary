import { Component, EventEmitter, Input, Output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { TherapistAppointmentModel } from '../../models';
import { AppointmentTimeModel } from '../../models';
import { AppointmentTimePipe } from "../../appointment-time.pipe";
import { BaseApplicationFormComponent, Utils } from '../../../../common';

@Component({
    selector: 'tr[app-therapist-appointments-row]',
    imports: [CommonModule, AppointmentTimePipe, ReactiveFormsModule],
    templateUrl: './therapist-appointments-row.html',
    styleUrl: './therapist-appointments-row.css'
})
export class TherapistAppointmentsRow extends BaseApplicationFormComponent implements OnInit {
    @Input({ required: true }) appointment!: TherapistAppointmentModel;
    @Input({ required: true }) index!: number;
    @Input({ required: true }) visibleColumns!: {
        date: boolean;
        time: boolean;
        patient: boolean;
        phone: boolean;
        therapy: boolean;
        notes: boolean;
    };

    @Output() delete = new EventEmitter<string>();
    @Output() updateNotes = new EventEmitter<{ id: string, notes: string }>();

    protected isEditingNotes = signal(false);

    constructor() {
        super();
    }

    ngOnInit(): void {
        this.initializeForm();
    }

    private initializeForm(): void {
        this.form = this.fb.group({
            therapistNotes: [this.appointment.therapistNotes || '', [Validators.maxLength(500)]]
        });

        Utils.setupClearServerErrorsOnValueChange(this.form, this.serverErrors);
    }

    public deleteElement(): void {
        const appointmentId = this.appointment.id;
        this.delete.emit(appointmentId);
    }

    public startEditingNotes(): void {
        this.form.patchValue({
            therapistNotes: this.appointment.therapistNotes || ''
        });
        this.isEditingNotes.set(true);
    }

    public saveNotes(): void {
        if (this.form.valid) {
            const formValue = this.form.value;
            const newTherapistNotes = formValue.therapistNotes?.trim() || '';

            this.updateNotes.emit({
                id: this.appointment.id,
                notes: newTherapistNotes
            });
            this.isEditingNotes.set(false);
        }
    }

    public cancelEditingNotes(): void {
        this.form.reset();
        this.isEditingNotes.set(false);
    }

    get therapistNotesControl() {
        return this.form.get('therapistNotes');
    }

    get notesControl() {
        return this.form.get('notes');
    }
}
