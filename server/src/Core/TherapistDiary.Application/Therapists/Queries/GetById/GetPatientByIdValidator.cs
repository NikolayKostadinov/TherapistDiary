namespace TherapistDiary.Application.Therapists.Queries.GetById;

using FluentValidation;

public class GetTherapistByIdValidator : AbstractValidator<GetTherapistByIdRequest>
{
    public GetTherapistByIdValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty();
    }
}
