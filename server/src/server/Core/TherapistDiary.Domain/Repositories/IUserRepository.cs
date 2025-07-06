namespace TherapistDiary.Domain.Repositories;

using TherapistDiary.Domain.Entities;

public interface IUserRepository
{
    Task<User?> GetUserByRefreshTokenAsync(string refreshToken);
}
