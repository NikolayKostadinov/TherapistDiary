namespace TherapistDiary.Application.Appointments.Commands.Update;

public record UpdateAppointmentRequest
{
    public Guid Id { get; set; }

    public Guid PatientId{get; set;}
    public Guid TherapistId{get; set;}
    public Guid TherapyId{get; set;}
    public DateOnly Date{get; set;}
    public TimeOnly Start{get; set;}
    public TimeOnly End{get; set;}
    public string? Notes { get; set; }
    public string? TherapistNotes { get; set; }
}
