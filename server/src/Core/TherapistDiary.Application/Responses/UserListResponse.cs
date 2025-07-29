namespace TherapistDiary.Application.Responses;

using AutoMapper;
using Domain.Entities;
using Domain.Repositories.Automapper;
using Infrastructure.AutoMapper;

public class UserListResponse : IMapFrom<User>, IHaveCustomMappings
{
    public UserListResponse()
    {
        Roles = [];
    }

    public required Guid Id { get; set; }
    public required string UserName { get; set; }
    public required string Email { get; set; }
    public required string FirstName { get; set; }
    public string? MidName { get; set; }
    public string FullName { get; set; }
    public required string LastName { get; set; }
    public required string PhoneNumber { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public List<RoleResponce> Roles { get; set; }

    public void CreateMappings(IProfileExpression configuration)
    {
        configuration.CreateMap<User, UserListResponse>()
            .ForMember(x => x.Roles, opt => opt.MapFrom(p => p.UserRoles.Select(ur => ur.Role.To<RoleResponce>())));
    }
}
