namespace TherapistDiary.Domain.Repositories;

using Dtos;

public interface ITherapyTypesRepository
{
    public Task<IEnumerable<TherapyTypeListDto>> GetAllTherapyTypesWithTherapiesAsync(CancellationToken cancellationToken);
}
