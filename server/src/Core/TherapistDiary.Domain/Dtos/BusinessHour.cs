namespace TherapistDiary.Domain.Dtos;

using Entities;
using Repositories.Automapper;

public class BusinessHour: IMapFrom<Appointment>
{
    public TimeOnly Start { get; set; }
    public TimeOnly End { get; set; }
}
