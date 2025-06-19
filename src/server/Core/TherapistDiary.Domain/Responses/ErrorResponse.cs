namespace TherapistDiary.Domain.Responses;

using Shared;

public class ErrorResponse
{
    public Guid Id { get; init; }
    public string Field { get; init; }
    public string Message { get; init; }
    public ErrorResponse(Error error)
        : this(error.Id, error.Field, error.Message)
    {
    }

    public ErrorResponse(Guid id, string field, string message)
    {
        Id = id;
        Field = field;
        Message = message;
    }
};
