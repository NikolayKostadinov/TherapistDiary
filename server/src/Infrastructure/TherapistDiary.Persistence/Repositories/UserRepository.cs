namespace TherapistDiary.Persistence.Repositories;

using Domain.Entities;
using Domain.Repositories;
using Domain.Repositories.Common;
using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public UserRepository(ApplicationDbContext dbContext)
    {
        _context = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users
                    .Include(x=>x.UserRoles)
                    .ThenInclude(r=>r.Role)
                    .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<User?> GetUserByRefreshTokenAsync(string refreshToken)
    {
        var user = await _context.Users
            .Include(x=>x.UserRoles)
            .FirstOrDefaultAsync(x => x.RefreshToken == refreshToken);
        return user;
    }

    public async Task<(IEnumerable<User> users, int totalCount, int totalPages)> GetAllPagedAsync(PaginationParameters parameters, CancellationToken cancellationToken)
    {
        var query = _context.Set<User>()
            .Include(x=>x.UserRoles)
            .ThenInclude(r=>r.Role)
            .AsQueryable();

        // Apply filtering
        if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
        {
            var searchTermLower = parameters.SearchTerm.ToLower();
            query = query.Where(p =>
                EF.Functions.Like(p.UserName, $"%{parameters.SearchTerm}%") ||
                EF.Functions.Like(p.FirstName, $"%{parameters.SearchTerm}%") ||
                EF.Functions.Like(p.MidName ?? "", $"%{parameters.SearchTerm}%") ||
                EF.Functions.Like(p.LastName, $"%{parameters.SearchTerm}%") ||
                EF.Functions.Like(p.Email, $"%{parameters.SearchTerm}%") ||
                EF.Functions.Like(p.PhoneNumber, $"%{parameters.SearchTerm}%"));
        }

        // Apply sorting
        if (!string.IsNullOrWhiteSpace(parameters.SortBy))
        {
            query = parameters.SortBy.ToLowerInvariant() switch
            {
                "firstname" => parameters.SortDescending ?? false
                    ? query.OrderByDescending(p => p.FirstName)
                    : query.OrderBy(p => p.FirstName),

                "midname" => parameters.SortDescending ?? false
                    ? query.OrderByDescending(p => p.MidName)
                    : query.OrderBy(p => p.MidName),

                "lastname" => parameters.SortDescending ?? false
                    ? query.OrderByDescending(p => p.LastName)
                    : query.OrderBy(p => p.LastName),

                "phonenumber" => parameters.SortDescending ?? false
                    ? query.OrderByDescending(p => p.PhoneNumber)
                    : query.OrderBy(p => p.PhoneNumber),

                _ => query.OrderBy(p => p.LastName).ThenBy(p => p.FirstName)
            };
        }

        // Apply pagination
        var totalCount = query.Count();
        var totalPages = totalCount / parameters.PageSize + (totalCount % parameters.PageSize > 0 ? 1 : 0);

        return (await query.AsQueryable()
            .Skip((parameters.PageNumber - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToDynamicListAsync<User>(cancellationToken), totalCount, totalPages);
    }

}
