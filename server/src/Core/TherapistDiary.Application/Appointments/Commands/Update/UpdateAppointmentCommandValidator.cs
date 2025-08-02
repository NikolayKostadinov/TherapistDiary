namespace TherapistDiary.Application.Appointments.Commands.Update;

using FluentValidation;
using TherapistDiary.Common.Constants;
using TherapistDiary.Common.Extensions;

public class UpdateAppointmentCommandValidator : AbstractValidator<UpdateAppointmentRequest>
{
    public UpdateAppointmentCommandValidator()
    {
        RuleFor(x => x.TherapistId)
            .NotEmpty();
        RuleFor(x => x.TherapyId)
            .NotEmpty();
        RuleFor(x => x.Date)
            .NotEmpty()
            .GreaterThanOrEqualTo(DateOnly.FromDateTime(TimeProvider.System.GetLocalDateTime()));
        RuleFor(x => x.Start)
            .NotEmpty();
        RuleFor(x=>x.End)
            .NotEmpty();
    }
}
