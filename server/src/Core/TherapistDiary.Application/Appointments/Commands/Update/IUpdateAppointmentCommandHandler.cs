namespace TherapistDiary.Application.Appointments.Commands.Update;

using Domain.Entities;
using Domain.Shared;

public interface IUpdateAppointmentCommandHandler:ICommand<UpdateAppointmentRequest,Appointment>
{
}
