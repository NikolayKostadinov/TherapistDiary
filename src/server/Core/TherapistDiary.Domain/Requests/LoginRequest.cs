namespace TherapistDiary.Domain.Requests;

public record LoginRequest
{
    public required string UserName { get; init; }
    public required string Password { get; init; }
}
