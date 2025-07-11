namespace TherapistDiary.Domain.Dtos;

public class TherapyListDto
{
    public required Guid Id { get; set; }
    public string Name { get; private set; } = null!;
}
