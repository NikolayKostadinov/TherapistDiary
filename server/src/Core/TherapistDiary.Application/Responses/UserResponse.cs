namespace TherapistDiary.Application.Responses;

using Domain.Entities;
using Infrastructure.AutoMapper;

public class UserResponse: IMapFrom<User>
{
    public required Guid Id { get; set; }
    public required string UserName { get; set; }
    public required string Email { get; set; }
    public required string FirstName { get; set; }
    public string? MidName { get; set; }
    public required string LastName { get; set; }
    public required string FullName { get; set; }
    public required string PhoneNumber { get; set; }
    public string? Specialty { get; set; }
    public string? Biography { get; set; }
    public string? ProfilePictureUrl { get; set; }
}
