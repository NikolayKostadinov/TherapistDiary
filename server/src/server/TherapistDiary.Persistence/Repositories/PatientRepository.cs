using Microsoft.EntityFrameworkCore;
using TherapistDiary.Application.Common.Models;
using TherapistDiary.Domain.Entities;
using TherapistDiary.Domain.Repositories;
using TherapistDiary.Persistence.Common;

namespace TherapistDiary.Persistence.Repositories;

public class PatientRepository : Repository<Patient>, IPatientRepository
{
    public PatientRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<PagedResult<Patient>> GetAllAsync(
        int page = 1,
        int pageSize = 10,
        string? searchTerm = null,
        string? sortBy = null,
        bool sortDescending = false,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Set<Patient>().AsQueryable();

        // Apply search filter
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(p => 
                p.FirstName.Contains(searchTerm) ||
                p.LastName.Contains(searchTerm) ||
                p.Email.Contains(searchTerm) ||
                p.PhoneNumber.Contains(searchTerm));
        }

        // Apply sorting
        query = sortBy?.ToLower() switch
        {
            "firstname" => sortDescending ? query.OrderByDescending(p => p.FirstName) : query.OrderBy(p => p.FirstName),
            "lastname" => sortDescending ? query.OrderByDescending(p => p.LastName) : query.OrderBy(p => p.LastName),
            "email" => sortDescending ? query.OrderByDescending(p => p.Email) : query.OrderBy(p => p.Email),
            "dateofbirth" => sortDescending ? query.OrderByDescending(p => p.DateOfBirth) : query.OrderBy(p => p.DateOfBirth),
            "createdon" => sortDescending ? query.OrderByDescending(p => p.CreatedOn) : query.OrderBy(p => p.CreatedOn),
            _ => query.OrderBy(p => p.LastName).ThenBy(p => p.FirstName) // Default sorting
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Patient>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
            HasNextPage = page * pageSize < totalCount,
            HasPreviousPage = page > 1
        };
    }
}
