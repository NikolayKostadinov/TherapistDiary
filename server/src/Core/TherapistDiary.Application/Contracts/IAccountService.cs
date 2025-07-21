namespace TherapistDiary.Application.Contracts;

using Domain.Entities;
using Domain.Shared;
using Requests;
using Responses;

public interface IAccountService
{
    Task<Result<UserResponse>> GetUserById(Guid userId);
    Task<Result> RegisterAsync(UserRegisterRequest userRegisterRequest);
    Task<Result> LoginAsync(UserLoginRequest userLoginRequest);
    Task<Result> RefreshTokenAsync(string? refreshToken);
    Task<Result> UpdateAsync(UserUpdateRequest userUpdateRequest);
    Task<Result<User>> AddUserInRoleAsync(string userId, string roleName);
    Task<Result<User>> RemoveUserFromRoleAsync(string userId, string roleName);
    Task<Result> DeleteAsync(Guid id);
}
