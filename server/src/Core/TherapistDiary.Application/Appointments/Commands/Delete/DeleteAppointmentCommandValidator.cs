namespace TherapistDiary.Application.Appointments.Commands.Delete;

using FluentValidation;

public class DeleteAppointmentCommandValidator : AbstractValidator<DeleteAppointmentRequest>
{
    public DeleteAppointmentCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty();
    }
}
