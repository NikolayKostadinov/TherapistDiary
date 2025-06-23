namespace TherapistDiary.Application.Contracts;

using Domain.Shared;
using Requests;

public interface IAccountService
{
    Task<Result> RegisterAsync(RegisterRequest registerRequest);
    Task<Result> LoginAsync(LoginRequest loginRequest);
    Task<Result> RefreshTokenAsync(string? refreshToken);
}
