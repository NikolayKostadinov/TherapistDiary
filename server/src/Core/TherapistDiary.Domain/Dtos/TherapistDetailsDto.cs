namespace TherapistDiary.Domain.Dtos;

public class TherapistDetailsDto
{
    public Guid Id { get; init; }
    public string FirstName { get; init; } = null!;
    public string? MidName { get; init; }
    public string LastName { get; init; } = null!;
    public string FullName { get; set; } = null!;
    public string? Specialty { get; init; }
    public string? Biography { get; init; }
    public string? ProfilePictureUrl { get; init; }
    public string? PhoneNumber { get; set; }
}
