namespace TherapistDiary.Application.Requests;

public record UserUpdateRequest
{
    public required Guid Id { get; set; }
    public required string FirstName { get; init; }
    public string? MidName { get; init; }
    public required string LastName { get; init; }
    public required string Email { get; init; }
    public required string Password { get; init; }
    public string? PhoneNumber { get; set; }
    public string? Specialty { get; init; }
    public string? Biography { get; init; }
    public string? ProfilePictureUrl { get; init; }
}
