namespace TherapistDiary.Persistence.Repositories;

using Domain.Entities;
using Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;
using Domain.Repositories.Common;

public class PatientRepository : IPatientRepository
{
    private readonly ApplicationDbContext _context;

    public PatientRepository(ApplicationDbContext dbContext)
    {
        _context = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    public async Task<Patient?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.Set<Patient>()
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Patient>> GetAllPagedAsync(PaginationParameters parameters, CancellationToken cancellationToken)
    {
        var query = _context.Set<Patient>().AsQueryable();

        // Apply filtering
        if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
        {
            var searchTermLower = parameters.SearchTerm.ToLower();
            query = query.Where(p =>
                EF.Functions.Like(p.FirstName, $"%{parameters.SearchTerm}%") ||
                EF.Functions.Like(p.MidName ?? "", $"%{parameters.SearchTerm}%") ||
                EF.Functions.Like(p.LastName, $"%{parameters.SearchTerm}%") ||
                EF.Functions.Like(p.PhoneNumber, $"%{parameters.SearchTerm}%"));
        }

        // Apply sorting
        if (!string.IsNullOrWhiteSpace(parameters.SortBy))
        {
            query = parameters.SortBy.ToLowerInvariant() switch
            {
                "firstname" => parameters.SortDescending
                    ? query.OrderByDescending(p => p.FirstName)
                    : query.OrderBy(p => p.FirstName),

                "lastname" => parameters.SortDescending
                    ? query.OrderByDescending(p => p.LastName)
                    : query.OrderBy(p => p.LastName),

                "phonenumber" => parameters.SortDescending
                    ? query.OrderByDescending(p => p.PhoneNumber)
                    : query.OrderBy(p => p.PhoneNumber),

                _ => query.OrderBy(p => p.LastName).ThenBy(p => p.FirstName)
            };
        }

        // Apply pagination
        return await query.AsQueryable()
            .Skip((parameters.PageNumber - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToDynamicListAsync<Patient>(cancellationToken);
    }


    public async Task AddAsync(Patient patient, CancellationToken cancellationToken)
    {
        await _context.Set<Patient>().AddAsync(patient, cancellationToken);
    }

    public Task UpdateAsync(Patient patient, CancellationToken cancellationToken)
    {
        _context.Set<Patient>().Update(patient);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Patient patient, CancellationToken cancellationToken)
    {
        _context.Set<Patient>().Remove(patient);
        return Task.CompletedTask;
    }
}
