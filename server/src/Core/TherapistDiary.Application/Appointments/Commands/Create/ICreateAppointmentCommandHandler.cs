namespace TherapistDiary.Application.Appointments.Commands.Create;

using Domain.Entities;
using Domain.Shared;

public interface ICreateAppointmentCommandHandler:ICommand<CreateAppointmentRequest,Appointment>
{
}
