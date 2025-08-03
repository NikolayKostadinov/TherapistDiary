namespace TherapistDiary.Application.Appointments.Commands.UpdateNotes;

public record UpdateAppointmentNotesRequest
{
    public Guid Id { get; set; }
    public string? Notes { get; set; }
}
