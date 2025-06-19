namespace TherapistDiary.Application.Patients.Commands.Create;

using Common.Constants;
using Domain.Entities;
using FluentValidation;

public class CreatePatientCommandValidator : AbstractValidator<CreatePatientRequest>
{
    public CreatePatientCommandValidator()
    {
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
