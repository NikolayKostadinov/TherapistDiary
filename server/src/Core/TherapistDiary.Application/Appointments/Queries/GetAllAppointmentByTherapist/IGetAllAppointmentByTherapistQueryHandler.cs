namespace TherapistDiary.Application.Appointments.Queries.GetAllAppointmentByTherapist;

using Common.Models;
using Responses;
using Domain.Shared;

public interface IGetAllAppointmentByTherapistQueryHandler : ICommand<GetAllAppointmentByTherapistRequest, PagedResult<AppointmentByTherapistResponse>>
{
}
