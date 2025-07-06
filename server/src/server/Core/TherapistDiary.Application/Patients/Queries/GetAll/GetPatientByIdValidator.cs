namespace TherapistDiary.Application.Patients.Queries.GetAll;

using FluentValidation;
using TherapistDiary.Common.Constants;

public class GetPatientByIdValidator : AbstractValidator<GetAllPatientRequest>
{
    public GetPatientByIdValidator()
    {
        RuleFor(x => x.PageNumber)
            .NotNull()
            .GreaterThan(GlobalConstants.Page.MinPageNumber);
        RuleFor(x => x.PageSize)
            .NotNull()
            .GreaterThanOrEqualTo(GlobalConstants.Page.MinPageSize)
            .LessThanOrEqualTo(GlobalConstants.Page.MaxPageSize);
    }
}
