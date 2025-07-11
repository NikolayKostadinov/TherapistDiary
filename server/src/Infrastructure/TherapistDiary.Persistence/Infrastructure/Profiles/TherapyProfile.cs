namespace TherapistDiary.Persistence.Infrastructure.Profiles;

using AutoMapper;
using Domain.Dtos;
using Domain.Entities;

public class TherapyProfile : Profile
{
    public TherapyProfile()
    {
        CreateMap<Therapy, TherapyListDto>();
        CreateMap<TherapyType, TherapyTypeListDto>();
    }
}
