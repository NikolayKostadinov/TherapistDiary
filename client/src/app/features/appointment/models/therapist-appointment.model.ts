import { AppointmentTimeModel } from "./appointment-time.model";

export interface TherapistAppointmentModel extends AppointmentTimeModel {
    id: string;
    patientFullName: string;
    therapyName: string;
    date: string; // DateOnly from backend
    notes?: string;
    therapistNotes?: string;
    patientAge?: number;
    patientPhoneNumber?: string;
}
