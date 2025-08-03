namespace TherapistDiary.Application.Appointments.Commands.UpdateNotes;

using FluentValidation;

public class UpdateAppointmentNotesCommandValidator : AbstractValidator<UpdateAppointmentNotesRequest>
{
    public UpdateAppointmentNotesCommandValidator()
    {
    }
}
