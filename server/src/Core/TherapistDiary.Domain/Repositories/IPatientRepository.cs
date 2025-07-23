namespace TherapistDiary.Domain.Repositories;

using System.Linq.Dynamic.Core;
using Common;
using Entities;

public interface IPatientRepository
{
    Task<Patient?> GetByIdAsync(Guid requestId, CancellationToken cancellationToken);
    Task<(IEnumerable<Patient> patients, int totalCount, int totalPages)> GetAllPagedAsync(PaginationParameters parameters, CancellationToken cancellationToken);
    Task AddAsync(Patient patient, CancellationToken cancellationToken);
    Task UpdateAsync(Patient patient, CancellationToken cancellationToken);
    Task DeleteAsync(Patient patient, CancellationToken cancellationToken);
}
