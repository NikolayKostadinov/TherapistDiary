namespace TherapistDiary.Application.Contracts;

using Domain.Requests;
using Domain.Shared;

public interface IAccountService
{
    Task<Result> RegisterAsync(RegisterRequest registerRequest);
    Task<Result> LoginAsync(LoginRequest loginRequest);
    Task<Result> RefreshTokenAsync(string? refreshToken);
}
