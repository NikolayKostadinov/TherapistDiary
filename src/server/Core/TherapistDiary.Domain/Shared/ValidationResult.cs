namespace TherapistDiary.Domain.Shared;

using Common.Extensions;

public sealed class ValidationResult : Result, IValidationResult
{
    private ValidationResult(IEnumerable<Error> errors)
        : base(errors)
    { }

    public static ValidationResult WithErrors(IEnumerable<Error> errors) =>
        new(errors.Select(x=> new Error(x.Field, x.Message)));
}
