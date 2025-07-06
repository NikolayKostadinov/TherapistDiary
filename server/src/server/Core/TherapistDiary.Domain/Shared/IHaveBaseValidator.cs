namespace TherapistDiary.Domain.Shared;

using TherapistDiary.Domain.Errors;

public interface IHaveBaseValidator
{
    Result ValidateBase(Operations operation);
}
