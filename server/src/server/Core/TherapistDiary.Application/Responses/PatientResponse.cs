namespace TherapistDiary.Application.Responses;

using Domain.Entities;
using Infrastructure.AutoMapper;

public record PatientResponse : IMapFrom<Patient>
{
    public Guid Id { get; init; }
    public string FirstName { get; init; } = null!;
    public string? MidName { get; init; }
    public string LastName { get; init; } = null!;
    public int Age { get; init; }
    public string PhoneNumber { get; init; } = null!;
}
