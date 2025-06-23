namespace TherapistDiary.Application.Responses;

using Domain.Shared;
using Infrastructure.AutoMapper;

public class ErrorResponse:IMapFrom<Error>
{
    public Guid Id { get; init; }
    public string Field { get; init; }
    public string Message { get; init; }
    public ErrorResponse(Error error)
    {
        Id = error.Id;
        Field = error.Field;
        Message = error.Message;
    }
};
