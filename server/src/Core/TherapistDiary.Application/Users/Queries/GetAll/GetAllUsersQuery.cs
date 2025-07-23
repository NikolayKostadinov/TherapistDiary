namespace TherapistDiary.Application.Users.Queries.GetAll;

using Common.Models;
using TherapistDiary.Application.Infrastructure.AutoMapper;
using Responses;
using Domain.Repositories;
using Domain.Shared;

public class GetAllUsersQuery : IGetAllUsersQuery
{
    private readonly IUserRepository _usersRepository;

    public GetAllUsersQuery(IUserRepository patientRepository)
    {
        _usersRepository = patientRepository ?? throw new ArgumentNullException(nameof(patientRepository));
    }

    public async Task<Result<PagedResult<UserListResponse>>> Handle(GetAllUsersRequest request,
        CancellationToken cancellationToken)
    {
        var (users, totalCount, totalPages) = await _usersRepository.GetAllPagedAsync(request, cancellationToken);

        return new PagedResult<UserListResponse>(
            users.To<List<UserListResponse>>(),
            totalCount,
            request.PageNumber,
            request.PageSize,
            totalPages,
            totalCount > request.PageSize * request.PageNumber,
            request.PageNumber > 1
        );
    }
}
