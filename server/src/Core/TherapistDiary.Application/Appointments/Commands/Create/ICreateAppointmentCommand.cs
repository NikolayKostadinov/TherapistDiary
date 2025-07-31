namespace TherapistDiary.Application.Appointments.Commands.Create;

using Domain.Entities;
using Domain.Shared;

public interface ICreateAppointmentCommand:ICommand<CreateAppointmentRequest,Appointment>
{
}
