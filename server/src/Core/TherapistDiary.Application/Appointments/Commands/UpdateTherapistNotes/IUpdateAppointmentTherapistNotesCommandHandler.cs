namespace TherapistDiary.Application.Appointments.Commands.UpdateTherapistNotes;

using Domain.Entities;
using Domain.Shared;

public interface IUpdateAppointmentTherapistNotesCommandHandler:ICommand<UpdateAppointmentTherapistNotesRequest,Appointment>
{
}
