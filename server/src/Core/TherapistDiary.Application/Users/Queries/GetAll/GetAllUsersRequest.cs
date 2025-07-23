namespace TherapistDiary.Application.Users.Queries.GetAll;
using TherapistDiary.Domain.Repositories.Common;

public class GetAllUsersRequest: PaginationParameters
{
    public GetAllUsersRequest()
    {
    }

    public GetAllUsersRequest(int pageNumber, int pageSize, string? searchTerm, string? sortBy, bool sortDescending)
        : base(pageNumber, pageSize, searchTerm, sortBy, sortDescending)
    {
    }
}
