import { Component, EventEmitter, Input, Output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { MyAppointmentModel } from '../../models';
import { AppointmentTimePipe } from "../../appointment-time.pipe";
import { ApplicationForm, Utils } from '../../../../common';

@Component({
    selector: 'tr[app-my-appointments-row]',
    imports: [CommonModule, AppointmentTimePipe, ReactiveFormsModule],
    templateUrl: './my-appointments-row.html',
    styleUrl: './my-appointments-row.css'
})
export class MyAppointmentsRow extends ApplicationForm implements OnInit {
    @Input({ required: true }) appointment!: MyAppointmentModel;
    @Input({ required: true }) index!: number;

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
            notes: [this.appointment.notes || '', [Validators.maxLength(500)]]
        });

        Utils.setupClearServerErrorsOnValueChange(this.form, this.serverErrors);
    }

    public deleteElement(): void {
        const appointmentId = this.appointment.id;
        this.delete.emit(appointmentId);
    }

    public startEditingNotes(): void {
        this.form.patchValue({ notes: this.appointment.notes || '' });
        this.isEditingNotes.set(true);
    }

    public saveNotes(): void {
        if (this.form.valid) {
            const formValue = this.form.value;
            const newNotes = formValue.notes?.trim() || '';

            this.updateNotes.emit({
                id: this.appointment.id,
                notes: newNotes
            });
            this.isEditingNotes.set(false);
        }
    }

    public cancelEditingNotes(): void {
        this.form.reset();
        this.isEditingNotes.set(false);
    }

    get notesControlIsValid() {
        return this.form.get('notes')?.valid && this.form.get('notes')?.touched;
    }
}
