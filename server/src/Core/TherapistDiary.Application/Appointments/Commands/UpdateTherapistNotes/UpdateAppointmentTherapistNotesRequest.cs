namespace TherapistDiary.Application.Appointments.Commands.UpdateTherapistNotes;

public record UpdateAppointmentTherapistNotesRequest
{
    public Guid Id { get; set; }
    public string? TherapistNotes { get; set; }
}
