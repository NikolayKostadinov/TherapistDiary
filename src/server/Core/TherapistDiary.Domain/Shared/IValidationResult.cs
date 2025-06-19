namespace TherapistDiary.Domain.Shared;

public interface IValidationResult
{
    IReadOnlyList<Error> Errors { get; }
}
