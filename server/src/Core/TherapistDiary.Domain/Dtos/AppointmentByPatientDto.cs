namespace TherapistDiary.Domain.Dtos;

public class AppointmentByPatientDto
{
    public Guid Id { get; set; }
    public string TherapistFullName { get; set; } = null!;
    public string TherapyName { get; set; }= null!;
    public DateOnly Date { get; set; }
    public TimeOnly Start { get; set; }
    public TimeOnly End { get; set; }
    public string? Notes { get; set; }
}
