namespace TherapistDiary.Application.Users.Queries.GetAll;

using Common.Models;
using Responses;
using Domain.Shared;

public interface IGetAllUsersQuery : ICommand<GetAllUsersRequest, PagedResult<UserListResponse>>
{
}
