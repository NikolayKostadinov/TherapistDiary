namespace TherapistDiary.Persistence.Infrastructure.Profiles;

using AutoMapper;
using Domain.Dtos;
using Domain.Entities;

public class TherapistProfile : Profile
{
    public TherapistProfile()
    {
        CreateMap<User, TherapistListDto>();
    }
}
