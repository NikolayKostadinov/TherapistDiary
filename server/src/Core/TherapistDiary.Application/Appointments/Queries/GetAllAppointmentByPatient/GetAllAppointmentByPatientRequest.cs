namespace TherapistDiary.Application.Appointments.Queries.GetAllAppointmentByPatient;

using TherapistDiary.Domain.Repositories.Common;

public class GetAllAppointmentByPatientRequest: PaginationParameters
{
    public GetAllAppointmentByPatientRequest()
    {
    }

    public GetAllAppointmentByPatientRequest(Guid patientId, int pageNumber, int pageSize, string? searchTerm, string? sortBy, bool sortDescending)
        : base(pageNumber, pageSize, searchTerm, sortBy, sortDescending)
    {
        PatientId = patientId;
    }

    public Guid PatientId { get; set; }
}
