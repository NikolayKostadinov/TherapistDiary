namespace TherapistDiary.Application.Appointments.Queries.GetAllAppointmentByPatient;

using Common.Models;
using Responses;
using Domain.Shared;

public interface IGetAllAppointmentByPatientQueryHandler : ICommand<GetAllAppointmentByPatientRequest, PagedResult<AppointmentByPatientResponse>>
{
}
