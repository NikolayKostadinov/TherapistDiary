namespace TherapistDiary.Application.Responses;

using Domain.Dtos;
using Domain.Repositories.Automapper;

public class AppointmentByTherapistResponse:IMapFrom<AppointmentByTherapistDto>
{
    public Guid Id { get; set; }
    public string PatientFullName { get; set; } = null!;
    public string PatientPhoneNumber { get; set; } = null!;
    public DateOnly Date { get; set; }
    public TimeOnly Start { get; set; }
    public TimeOnly End { get; set; }
    public string? Notes { get; set; }
    public string? TherapistNotes { get; set; }

}
