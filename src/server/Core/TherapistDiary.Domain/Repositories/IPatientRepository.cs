namespace TherapistDiary.Domain.Repositories;

using Entities;

public interface IPatientRepository
{
    Task AddAsync(Patient patient, CancellationToken cancellationToken);
}
