
namespace TherapistDiary.Domain.Repositories;

using Automapper;
using Common;
using Dtos;
using Entities;

public interface IAppointmentRepository
{
    Task<IEnumerable<T>> GetAppointments<T>(Guid therapistId, DateOnly requestDate)
        where T: IMapFrom<Appointment>;

    Task AddAsync(Appointment patient, CancellationToken cancellationToken);

    Task<(IEnumerable<AppointmentByPatientDto> patients, int totalCount, int totalPages)> GetAllByPatientPagedAsync(Guid patientId, PaginationParameters parameters, CancellationToken cancellationToken);
    Task<(IEnumerable<AppointmentByTherapistDto> patients, int totalCount, int totalPages)> GetAllByTherapistPagedAsync(Guid therapistId, PaginationParameters parameters, CancellationToken cancellationToken);
    Task<Appointment?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task DeleteAsync(Appointment patient, CancellationToken cancellationToken);
    Task UpdateAsync(Appointment appointment, CancellationToken cancellationToken);
}
