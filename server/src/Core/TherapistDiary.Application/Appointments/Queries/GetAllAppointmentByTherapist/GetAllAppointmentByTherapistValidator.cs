namespace TherapistDiary.Application.Appointments.Queries.GetAllAppointmentByTherapist;

using FluentValidation;
using TherapistDiary.Common.Constants;

public class GetAllAppointmentByTherapistValidator : AbstractValidator<GetAllAppointmentByTherapistRequest>
{
    public GetAllAppointmentByTherapistValidator()
    {
        RuleFor(x => x.TherapistId)
            .NotNull();
        RuleFor(x => x.PageNumber)
            .NotNull()
            .GreaterThan(GlobalConstants.Page.MinPageNumber);
        RuleFor(x => x.PageSize)
            .NotNull()
            .GreaterThanOrEqualTo(GlobalConstants.Page.MinPageSize)
            .LessThanOrEqualTo(GlobalConstants.Page.MaxPageSize);
    }
}
