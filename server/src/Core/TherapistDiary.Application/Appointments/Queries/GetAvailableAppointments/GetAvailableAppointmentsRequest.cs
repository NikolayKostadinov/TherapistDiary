namespace TherapistDiary.Application.Appointments.Queries.GetAvailableAppointments;

public class GetAvailableAppointmentsRequest
{
    public Guid TherapistId { get; set; }
    public DateOnly Date { get; set; }
}