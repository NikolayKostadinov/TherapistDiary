namespace TherapistDiary.Application.Requests;

public record RegisterRequest
{
    public required string FirstName { get; init; }
    public string? MidName { get; init; }
    public required string LastName { get; init; }
    public required string UserName { get; init; }
    public required string Email { get; set; }
    public required string Password { get; init; }
}
