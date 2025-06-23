namespace TherapistDiary.Application.Patients.Queries.GetAll;

using FluentValidation;

public class GetPatientByIdValidator : AbstractValidator<GetPatientByIdRequest>
{
    public GetPatientByIdValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty();
    }
}
