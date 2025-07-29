namespace TherapistDiary.Application.Contracts;

using Domain.Dtos;

public interface IBusinessHoursService
{
    IEnumerable<BusinessHour> GetAll(DateOnly date);
}
