namespace TherapistDiary.Application.Responses;

using Domain.Dtos;
using Domain.Repositories.Automapper;
using Infrastructure.AutoMapper;

public class TherapyTypeListResponse: IMapFrom<TherapyTypeListDto>
{
    public required Guid Id { get; set; }
    public string Name { get; private set; } = null!;
    public string BannerPictureUrl { get; private set; } = null!;
    public ICollection<TherapyListResponse> Therapies { get; private set; } = null!;
}

public class TherapyListResponse: IMapFrom<TherapyListDto>
{
    public required Guid Id { get; set; }
    public string Name { get; private set; } = null!;
}
