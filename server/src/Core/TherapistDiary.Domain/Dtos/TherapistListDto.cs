namespace TherapistDiary.Domain.Dtos;

public class TherapistListDto
{
    public required Guid Id { get; set; }
    public required string FullName { get; set; }
    public string? Specialty { get; set; }
    public string? ProfilePictureUrl { get; set; }
}
