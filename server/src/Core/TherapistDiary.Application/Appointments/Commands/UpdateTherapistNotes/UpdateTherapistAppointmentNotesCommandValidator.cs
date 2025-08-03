namespace TherapistDiary.Application.Appointments.Commands.UpdateTherapistNotes;

using FluentValidation;
using UpdateNotes;

public class UpdateAppointmentTherapistNotesCommandValidator : AbstractValidator<UpdateAppointmentNotesRequest>
{
    public UpdateAppointmentTherapistNotesCommandValidator()
    {
    }
}
