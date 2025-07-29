namespace TherapistDiary.Application.Responses;

using Domain.Entities;
using Domain.Repositories.Automapper;
using Infrastructure.AutoMapper;

public class RoleResponce:IMapFrom<Role>
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
}