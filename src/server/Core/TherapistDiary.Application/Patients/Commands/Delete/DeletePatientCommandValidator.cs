namespace TherapistDiary.Application.Patients.Commands.Delete;

using FluentValidation;

public class DeletePatientCommandValidator : AbstractValidator<DeletePatientRequest>
{
    public DeletePatientCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty();
    }
}
