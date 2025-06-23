namespace TherapistDiary.Application.Patients.Commands.Update;

public record UpdatePatientRequest
{
    public required Guid Id { get; init; }
    public required string FirstName { get; init; }
    public string? MidName { get; init; }
    public required string LastName { get; init; }
    public required int Age { get; init; }
    public required string PhoneNumber { get; init; }
}
