namespace TherapistDiary.Persistence.Repositories;

using Application.Infrastructure.AutoMapper;
using Domain.Dtos;
using Domain.Entities;
using Domain.Repositories;
using Microsoft.EntityFrameworkCore;

public class TherapistRepository : ITherapistRepository
{
    private readonly ApplicationDbContext _context;

    public TherapistRepository(ApplicationDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<IEnumerable<TherapistListDto>> GetAllForTeamAsync(CancellationToken cancellationToken)
    {
        return await _context.Set<User>()
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .Where(x => x.UserRoles.Any(ur => ur.Role.Name == "Therapist"))
            .To<TherapistListDto>()
            .ToListAsync(cancellationToken);
    }

    public async Task<TherapistDetailsDto?> GetByIdAsync(Guid requestId, CancellationToken cancellationToken)
    {
        var result = _context.Set<User>()
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .Where(x => x.UserRoles.Any(ur => ur.Role.Name == "Therapist"))
            .To<TherapistDetailsDto>();

        return await result.FirstOrDefaultAsync(x => x.Id == requestId, cancellationToken);
    }
}
