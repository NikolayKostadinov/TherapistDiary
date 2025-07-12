namespace TherapistDiary.Application.Therapists.Queries.GetById;

public record GetTherapistByIdRequest
{
    public required Guid Id { get; init; }
}
