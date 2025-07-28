namespace TherapistDiary.Domain.Interfaces;

using Dtos;

public interface IBusinessHoursService
{
    IEnumerable<BusinessHour> GetAll(DateOnly date);
}
