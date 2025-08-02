import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyAppointmentModel } from '../../models';
import { AppointmentTimeModel } from '../../models';
import { AppointmentTimePipe } from "../../appointment-time.pipe";

@Component({
    selector: 'tr[app-my-appointments-row]',
    imports: [CommonModule, AppointmentTimePipe],
    templateUrl: './my-appointments-row.html',
    styleUrl: './my-appointments-row.css'
})
export class MyAppointmentsRow {
    @Input({ required: true }) appointment!: MyAppointmentModel;
    @Input({ required: true }) index!: number;

    @Output() delete = new EventEmitter<string>();

    public deleteElement(): void {
        const appointmentId = this.appointment.id;
        this.delete.emit(appointmentId);

    }
}
