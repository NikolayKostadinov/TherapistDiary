namespace TherapistDiary.Application.Appointments.Commands.Create;

public record CreateAppointmentRequest
{
    public Guid PatientId{get; set;}
    public Guid TherapistId{get; set;}
    public Guid TherapyId{get; set;}
    public DateOnly Date{get; set;}
    public TimeOnly Start{get; set;}
    public TimeOnly End{get; set;}
    public string? Notes { get; set; }
}
