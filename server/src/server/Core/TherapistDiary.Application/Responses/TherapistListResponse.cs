namespace TherapistDiary.Application.Responses;

using Domain.Dtos;
using Domain.Entities;
using Infrastructure.AutoMapper;

public class TherapistListResponse: IMapFrom<TherapistListDto>
{
    public required Guid Id { get; set; }
    public required string FullName { get; set; }
    public string? Specialty { get; set; }
    public string? ProfilePictureUrl { get; set; }
}
