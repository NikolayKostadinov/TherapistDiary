namespace TherapistDiary.Application.Appointments.Queries.GetAvailableAppointments;

using Domain.Shared;
using Responses;

public interface IGetAvailableAppointmentsQuery: ICommand<GetAvailableAppointmentsRequest, IEnumerable<AvailableAppointmentResponse>>
{

}
