import { AppointmentTimeModel } from "./appointment-time.model";

export interface MyAppointmentModel extends AppointmentTimeModel {
    id: string;
    therapistFullName: string;
    therapyName: string;
    date: string; // DateOnly from backend
    notes?: string;
}
