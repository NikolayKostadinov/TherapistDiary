
namespace TherapistDiary.Domain.Repositories;

using Automapper;
using Entities;

public interface IAppointmentRepository
{
    Task<IEnumerable<T>> GetAppointments<T>(Guid therapistId, DateOnly requestDate)
        where T: IMapFrom<Appointment>;

    Task AddAsync(Appointment patient, CancellationToken cancellationToken);
}
