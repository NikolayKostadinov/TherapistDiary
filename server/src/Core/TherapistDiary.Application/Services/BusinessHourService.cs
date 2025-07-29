namespace TherapistDiary.Application.Services;

using Contracts;
using Domain.Dtos;
using Microsoft.Extensions.Options;

public class BusinessHourService : IBusinessHoursService
{
    private readonly IOptions<BusinessHours> _businessHours;

    public BusinessHourService(IOptions<BusinessHours> businessHours)
    {
        _businessHours = businessHours;
    }

    public IEnumerable<BusinessHour> GetAll(DateOnly date)
    {
        var businessHours = _businessHours.Value;
        var dayOfWeek = date.DayOfWeek.ToString().ToLower();
        return businessHours.Holidays.Any(x => x == dayOfWeek)
            ? []
            : businessHours.Hours.Select(ToBusinessHour);
    }

    private BusinessHour ToBusinessHour(TimeOnly hour)
    {
        return new BusinessHour()
        {
            Start = hour, End = hour.AddMinutes(_businessHours.Value.AppointmentDurationInMinutes)
        };
    }
}

public class BusinessHours
{
    public int AppointmentDurationInMinutes { get; set; }
    public List<TimeOnly> Hours { get; set; } = [];
    public List<string> Holidays { get; set; } = [];
}
