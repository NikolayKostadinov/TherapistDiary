namespace TherapistDiary.Application.Patients.Commands.Update;

using FluentValidation;
using TherapistDiary.Common.Constants;

public class UpdatePatientCommandValidator : AbstractValidator<UpdatePatientRequest>
{
    public UpdatePatientCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty();
        RuleFor(x => x.FirstName)
            .NotEmpty()
            .MinimumLength(GlobalConstants.Person.NameMinLength)
            .MaximumLength(GlobalConstants.Person.FirstNameMaxLength);
        RuleFor(x => x.MidName)
            .MinimumLength(GlobalConstants.Person.NameMinLength)
            .MaximumLength(GlobalConstants.Person.MidNameMaxLength);
        RuleFor(x => x.LastName)
            .NotEmpty()
            .MinimumLength(GlobalConstants.Person.NameMinLength)
            .MaximumLength(GlobalConstants.Person.LastNameMaxLength);
        RuleFor(x => x.Age)
            .NotEmpty()
            .GreaterThanOrEqualTo(GlobalConstants.Person.MinAge)
            .LessThanOrEqualTo(GlobalConstants.Person.MaxAge);
        RuleFor(x => x.PhoneNumber).NotEmpty();
    }
}
