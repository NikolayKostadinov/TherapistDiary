namespace TherapistDiary.Persistence.Repositories;

using Application.Infrastructure.AutoMapper;
using Domain.Dtos;
using Domain.Entities;
using Domain.Repositories;
using Microsoft.EntityFrameworkCore;

public class TherapyTypesRepository: ITherapyTypesRepository
{
    private readonly ApplicationDbContext _context;

    public TherapyTypesRepository(ApplicationDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<IEnumerable<TherapyTypeListDto>> GetAllTherapyTypesWithTherapiesAsync(
        CancellationToken cancellationToken)
    {
        return await _context.Set<TherapyType>()
            .Include(x=>x.Therapies)
            .OrderBy(x=>x.CreatedOn)
            .To<TherapyTypeListDto>()
            .ToListAsync(cancellationToken);
    }
}
