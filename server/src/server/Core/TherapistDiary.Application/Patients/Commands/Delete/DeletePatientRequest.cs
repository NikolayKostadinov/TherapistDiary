namespace TherapistDiary.Application.Patients.Commands.Delete;

public record DeletePatientRequest
{
    public required Guid Id { get; init; }
}
