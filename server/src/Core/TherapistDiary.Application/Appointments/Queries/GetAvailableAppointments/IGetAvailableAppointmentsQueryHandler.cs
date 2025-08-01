namespace TherapistDiary.Application.Appointments.Queries.GetAvailableAppointments;

using Domain.Shared;
using Responses;

public interface IGetAvailableAppointmentsQueryHandler: ICommand<GetAvailableAppointmentsRequest, IEnumerable<AvailableAppointmentResponse>>
{

}
