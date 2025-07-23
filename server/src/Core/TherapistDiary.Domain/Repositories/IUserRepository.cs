namespace TherapistDiary.Domain.Repositories;

using Common;
using Entities;

public interface IUserRepository
{
    Task<User?> GetUserByRefreshTokenAsync(string refreshToken);
    Task<(IEnumerable<User> users, int totalCount, int totalPages)> GetAllPagedAsync(PaginationParameters parameters, CancellationToken cancellationToken);
    Task<User?> GetByIdAsync(Guid id);
}
