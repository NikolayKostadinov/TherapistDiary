namespace TherapistDiary.Application.Appointments.Queries.GetAllAppointmentByTherapist;

using TherapistDiary.Domain.Repositories.Common;

public class GetAllAppointmentByTherapistRequest: PaginationParameters
{
    public GetAllAppointmentByTherapistRequest()
    {
    }

    public GetAllAppointmentByTherapistRequest(Guid therapistId, int pageNumber, int pageSize, string? searchTerm, string? sortBy, bool sortDescending)
        : base(pageNumber, pageSize, searchTerm, sortBy, sortDescending)
    {
        TherapistId = therapistId;
    }

    public Guid TherapistId { get; set; }
}
