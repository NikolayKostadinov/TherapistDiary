namespace TherapistDiary.Persistence.Repositories;

using Application.Infrastructure.AutoMapper;
using Domain.Entities;
using Domain.Repositories;
using Domain.Repositories.Automapper;
using Microsoft.EntityFrameworkCore;

public class AppointmentRepository:IAppointmentRepository
{
    private readonly ApplicationDbContext _context;

    public AppointmentRepository(ApplicationDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<IEnumerable<T>> GetAppointments<T>(Guid therapistId, DateOnly requestDate)
    where T: IMapFrom<Appointment>
    {
        return await _context.Set<Appointment>()
            .Where(a => a.TherapistId == therapistId && a.Date == requestDate)
            .To<T>()
            .ToListAsync();
    }

}
