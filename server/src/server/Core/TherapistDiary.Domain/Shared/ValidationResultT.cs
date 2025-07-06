namespace TherapistDiary.Domain.Shared;

public sealed class ValidationResult<TValue> : Result<TValue>, IValidationResult
{
    private ValidationResult(IEnumerable<Error> errors)
        : base(default, false, errors)
    {
    }

    public static ValidationResult<TValue> WithErrors(IEnumerable<Error> errors) => new(errors);
}