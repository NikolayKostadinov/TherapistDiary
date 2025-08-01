namespace TherapistDiary.Application.Responses;

using Domain.Dtos;
using Domain.Repositories.Automapper;

public class AppointmentByPatientResponse:IMapFrom<AppointmentByPatientDto>
{
    public Guid Id { get; set; }
    public required string TherapistFullName { get; set; }
    public required string TherapyName { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly Start { get; set; }
    public TimeOnly End { get; set; }
    public string? Notes { get; set; }
}
