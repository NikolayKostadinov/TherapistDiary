namespace TherapistDiary.Application.Appointments.Commands.Delete;

public record DeleteAppointmentRequest
{
    public required Guid Id { get; init; }
}
