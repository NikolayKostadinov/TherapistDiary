namespace TherapistDiary.Application.Patients.Queries.GetById;

public record GetPatientByIdRequest
{
    public required Guid Id { get; init; }
}
