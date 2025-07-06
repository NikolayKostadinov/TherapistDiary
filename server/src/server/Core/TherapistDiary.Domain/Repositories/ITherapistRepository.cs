namespace TherapistDiary.Domain.Repositories;

using Dtos;

public interface ITherapistRepository
{
    Task<IEnumerable<TherapistListDto>> GetAllForTeamAsync(CancellationToken cancellationToken);
}
