namespace TherapistDiary.Domain.Dtos;

public class TherapyTypeListDto
{
    public required Guid Id { get; set; }
    public string Name { get; private set; } = null!;
    public string BannerPictureUrl { get; private set; } = null!;
    public ICollection<TherapyListDto> Therapies { get; private set; } = null!;
}