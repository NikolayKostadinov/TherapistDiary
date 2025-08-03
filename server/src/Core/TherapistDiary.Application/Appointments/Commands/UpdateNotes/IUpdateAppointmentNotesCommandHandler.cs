namespace TherapistDiary.Application.Appointments.Commands.UpdateNotes;

using TherapistDiary.Domain.Entities;
using TherapistDiary.Domain.Shared;

public interface IUpdateAppointmentNotesCommandHandler:ICommand<UpdateAppointmentNotesRequest,Appointment>
{
}
