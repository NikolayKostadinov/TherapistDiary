export interface AppointmentCreateModel {
    patientId: string;
    therapistId: string;
    therapyId: string;
    date: string;
    start: string;
    end: string;
    notes?: string;
}
