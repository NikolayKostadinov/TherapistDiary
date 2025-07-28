namespace TherapistDiary.Application.Responses;

using Domain.Entities;
using Infrastructure.AutoMapper;

public class AvailableAppointmentResponse: IMapFrom<Appointment>
{
    public AvailableAppointmentResponse(TimeOnly start, TimeOnly end)
    {
        Start = start;
        End = end;
    }

    public TimeOnly Start { get; set; }
    public TimeOnly End { get; set; }
}
