export interface AppointmentCreateModel {
  patientId: string,
  therapistId: string,
  therapyId: string,
  date: string, // DateOnly във формат YYYY-MM-DD
  start: string,
  end: string,
  notes? : string
}
