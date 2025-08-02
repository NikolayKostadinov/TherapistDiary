namespace TherapistDiary.Persistence.Repositories;

using Application.Infrastructure.AutoMapper;
using Domain.Dtos;
using Domain.Entities;
using Domain.Repositories;
using Domain.Repositories.Automapper;
using Domain.Repositories.Common;
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

    public async Task AddAsync(Appointment appointment, CancellationToken cancellationToken)
    {
        await _context.Set<Appointment>().AddAsync(appointment, cancellationToken);
    }

    public async Task<(IEnumerable<AppointmentByPatientDto> patients, int totalCount, int totalPages)>
        GetAllByPatientPagedAsync(
        Guid patientId, 
        PaginationParameters parameters,
        CancellationToken cancellationToken)
    {
        var query = _context.Set<Appointment>()
            .Where(a=>a.PatientId == patientId)
            .Include(a=>a.Therapist)
            .Include(a=>a.Therapy)
            .AsQueryable();

        // Apply filtering FIRST
        if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
        {
            var searchTermLower = parameters.SearchTerm.ToLower();
            query = query.Where(p =>
                EF.Functions.Like(p.Therapist.FirstName ?? "", $"%{searchTermLower}%") ||
                EF.Functions.Like(p.Therapist.MidName ?? "", $"%{searchTermLower}%") ||
                EF.Functions.Like(p.Therapist.LastName ?? "", $"%{searchTermLower}%") ||
                EF.Functions.Like(p.Date.ToString(), $"%{parameters.SearchTerm}%"));
        }

        // Calculate total count AFTER filtering
        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = totalCount / parameters.PageSize + (totalCount % parameters.PageSize > 0 ? 1 : 0);

        // Apply sorting
        if (!string.IsNullOrWhiteSpace(parameters.SortBy))
        {
            query = parameters.SortBy.ToLowerInvariant() switch
            {
                "therapist" => parameters.SortDescending ?? false
                    ? query.OrderByDescending(p => p.Therapist.FullName)
                    : query.OrderBy(p =>  p.Therapist.FullName),

                "therapy" => parameters.SortDescending ?? false
                    ? query.OrderByDescending(p => p.Therapy.Name)
                    : query.OrderBy(p => p.Therapy.Name),

                "date" => parameters.SortDescending ?? false
                    ? query.OrderByDescending(p => p.Date)
                    : query.OrderBy(p => p.Date),

                _ => query.OrderBy(p => p.Date)
            };
        }

        // Apply pagination and mapping
        var results = await query
            .Skip((parameters.PageNumber - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .To<AppointmentByPatientDto>()
            .ToListAsync(cancellationToken);

        return (results, totalCount, totalPages);
    }

    public async Task<(IEnumerable<AppointmentByTherapistDto> patients, int totalCount, int totalPages)>
        GetAllByTherapistPagedAsync(
        Guid therapistId,
        PaginationParameters parameters,
        CancellationToken cancellationToken)
    {
        var query = _context.Set<Appointment>()
            .Where(a=>a.TherapistId == therapistId)
            .Include(a=>a.Patient)
            .Include(a=>a.Therapy)
            .AsQueryable();

        // Apply filtering FIRST
        if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
        {
            var searchTermLower = parameters.SearchTerm.ToLower();
            query = query.Where(p =>
                EF.Functions.Like(p.Therapy.Name, $"%{searchTermLower}%") ||
                EF.Functions.Like(p.Patient.FirstName, $"%{searchTermLower}%") ||
                EF.Functions.Like(p.Patient.MidName ?? "", $"%{searchTermLower}%") ||
                EF.Functions.Like(p.Patient.LastName, $"%{searchTermLower}%") ||
                EF.Functions.Like(p.Date.ToString("dd/MM/yyyy"), $"%{searchTermLower}%"));
        }

        // Calculate total count AFTER filtering
        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = totalCount / parameters.PageSize + (totalCount % parameters.PageSize > 0 ? 1 : 0);

        // Apply sorting
        if (!string.IsNullOrWhiteSpace(parameters.SortBy))
        {
            query = parameters.SortBy.ToLowerInvariant() switch
            {
                "patient" => parameters.SortDescending ?? false
                    ? query.OrderByDescending(p => p.Patient.FullName)
                    : query.OrderBy(p =>  p.Patient.FullName),

                "therapy" => parameters.SortDescending ?? false
                    ? query.OrderByDescending(p => p.Therapy.Name)
                    : query.OrderBy(p => p.Therapy.Name),

                "date" => parameters.SortDescending ?? false
                    ? query.OrderByDescending(p => p.Date)
                    : query.OrderBy(p => p.Date),

                _ => query.OrderBy(p => p.Date)
            };
        }

        // Apply pagination and mapping
        var results = await query
            .Skip((parameters.PageNumber - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .To<AppointmentByTherapistDto>()
            .ToListAsync(cancellationToken);

        return (results, totalCount, totalPages);
    }

    public async Task<Appointment?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context
            .Set<Appointment>()
            .FindAsync(id, cancellationToken);
    }

    public Task DeleteAsync(Appointment patient, CancellationToken cancellationToken)
    {
        _context.Set<Appointment>().Remove(patient);
        return Task.CompletedTask;
    }
}
