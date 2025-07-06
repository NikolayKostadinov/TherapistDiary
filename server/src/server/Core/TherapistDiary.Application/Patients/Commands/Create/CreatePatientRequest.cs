namespace TherapistDiary.Application.Patients.Commands.Create;

public record CreatePatientRequest
{
    public required string FirstName { get; init;}
    public string? MidName { get; init; }
    public required string LastName { get; init; }
    public required int Age { get; init; }
    public required string PhoneNumber { get; init; }

}