namespace TherapistDiary.Application.Requests;

public record UserLoginRequest
{
    public required string UserName { get; init; }
    public required string Password { get; init; }
}
