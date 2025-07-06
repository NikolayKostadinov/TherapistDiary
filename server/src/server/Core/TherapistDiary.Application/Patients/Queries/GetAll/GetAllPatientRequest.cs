namespace TherapistDiary.Application.Patients.Queries.GetAll;

using Domain.Repositories.Common;

public class GetAllPatientRequest: PaginationParameters
{
    public GetAllPatientRequest()
    {
    }

    public GetAllPatientRequest(int pageNumber, int pageSize, string? searchTerm, string? sortBy, bool sortDescending)
        : base(pageNumber, pageSize, searchTerm, sortBy, sortDescending)
    {
    }
}
