namespace TherapistDiary.Application.Appointments.Queries.GetAllAppointmentByPatient;

using FluentValidation;
using TherapistDiary.Common.Constants;

public class GetAllAppointmentByPatientValidator : AbstractValidator<GetAllAppointmentByPatientRequest>
{
    public GetAllAppointmentByPatientValidator()
    {
        RuleFor(x => x.PatientId)
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
