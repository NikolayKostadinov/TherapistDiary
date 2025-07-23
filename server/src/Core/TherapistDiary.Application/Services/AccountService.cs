namespace TherapistDiary.Application.Services;

using Contracts;
using Domain.Entities;
using Domain.Repositories;
using Domain.Resources;
using Domain.Shared;
using Infrastructure.AutoMapper;
using Microsoft.AspNetCore.Identity;
using Requests;
using Responses;
using TherapistDiary.Common.Extensions;
using static Domain.Errors.DomainErrors;

public class AccountService : IAccountService
{
    private readonly IAuthTokenProcessor _authTokenProcessor;
    private readonly UserManager<User> _userManager;
    private readonly IUserRepository _userRepository;
    private readonly TimeProvider _timeProvider;


    public AccountService(
        IAuthTokenProcessor authTokenProcessor,
        UserManager<User> userManager,
        IUserRepository userRepository,
        TimeProvider timeProvider)
    {
        _authTokenProcessor = authTokenProcessor ?? throw new ArgumentNullException(nameof(authTokenProcessor));
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _timeProvider = timeProvider ?? throw new ArgumentNullException(nameof(timeProvider));
    }

    public async Task<Result<UserResponse>> GetUserById(Guid userId )
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user is null)
        {
            var message = string.Format(ErrorMessages.USER_NOT_FOUND, userId);
            return Result.Failure<UserResponse>(Error.Create(message));
        }

        return user.To<UserResponse>();
    }

    public async Task<Result> RegisterAsync(UserRegisterRequest userRegisterRequest)
    {
        var userExist = await _userManager.FindByNameAsync(userRegisterRequest.UserName) is not null;
        if (userExist)
        {
            var message = string.Format(ErrorMessages.USER_ALREADY_EXISTS, userRegisterRequest.UserName);
            return Result.Failure(Error.Create(message));
        }

        var user = User.Create(
            userRegisterRequest.UserName,
            userRegisterRequest.Email,
            userRegisterRequest.FirstName,
            userRegisterRequest.LastName,
            userRegisterRequest.MidName,
            userRegisterRequest.PhoneNumber,
            userRegisterRequest.Specialty,
            userRegisterRequest.Biography,
            userRegisterRequest.ProfilePictureUrl);

        var passwordValidationResult = await ValidatePasswordAsync(userRegisterRequest.Password);
        if (!passwordValidationResult.Succeeded)
        {
            return Result.Failure(IdentityError(passwordValidationResult, nameof(userRegisterRequest.Password)));
        }

        user.PasswordHash = _userManager.PasswordHasher.HashPassword(user, userRegisterRequest.Password);


        var result = await _userManager.CreateAsync(user);

        if (result.Succeeded)
        {
            await GenerateAndStoreTokens(user);
        }

        return result.Succeeded
            ? Result.Success()
            : Result.Failure(IdentityError(result));
    }

    public async Task<Result> UpdateAsync(UserUpdateRequest userUpdateRequest)
    {
        var user = await _userManager.FindByIdAsync(userUpdateRequest.Id.ToString());
        if (user is null)
        {
            var message = string.Format(ErrorMessages.USER_NOT_FOUND, userUpdateRequest.Id);
            return Result.Failure(Error.Create(message));
        }

        user.Update(
            userUpdateRequest.Email,
            userUpdateRequest.FirstName,
            userUpdateRequest.LastName,
            userUpdateRequest.MidName,
            userUpdateRequest.PhoneNumber,
            userUpdateRequest.Specialty,
            userUpdateRequest.Biography,
            userUpdateRequest.ProfilePictureUrl
        );

        var result = await _userManager.UpdateAsync(user);

        if (result.Succeeded)
        {
            await GenerateAndStoreTokens(user);
        }

        return result.Succeeded
            ? Result.Success()
            : Result.Failure(IdentityError(result));
    }

   public async Task<Result<User>> AddUserInRoleAsync(string userId, string roleName)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            var message = string.Format(ErrorMessages.USER_NOT_FOUND, userId);
            return Result.Failure<User>(Error.Create(message));
        }

        var result = await _userManager.AddToRoleAsync(user, roleName);
        return result.Succeeded
            ? Result.Success(user)
            : Result.Failure<User>(IdentityError(result));
    }

    public async Task<Result<User>> RemoveUserFromRoleAsync(string userId, string roleName)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            var message = string.Format(ErrorMessages.USER_NOT_FOUND, userId);
            return Result.Failure<User>(Error.Create(message));
        }
        var result = await _userManager.RemoveFromRoleAsync(user, roleName);
        return result.Succeeded
            ? Result.Success(user)
            : Result.Failure<User>(IdentityError(result));
    }

    public async Task<Result> DeleteAsync(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user is null)
        {
            var message = string.Format(ErrorMessages.USER_NOT_FOUND, id);
            return Result.Failure(Error.Create(message));
        }

        var result = await _userManager.DeleteAsync(user);
        return result.Succeeded
            ? Result.Success()
            : Result.Failure(IdentityError(result));
    }

    public async Task<Result> ChangePassword(Guid id, string oldPassword, string newPassword)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user is null)
        {
            var message = string.Format(ErrorMessages.USER_NOT_FOUND, id);
            return Result.Failure(Error.Create(message));
        }

        // Validate the new password
        var passwordValidationResult = await ValidatePasswordAsync(newPassword);
        if (!passwordValidationResult.Succeeded)
        {
            return Result.Failure(passwordValidationResult.Errors.Select(e => Error.Create("Password", e.Description)));
        }

        // Change the password using UserManager
        var result = await _userManager.ChangePasswordAsync(user, oldPassword, newPassword);

        if (result.Succeeded)
        {
            await GenerateAndStoreTokens(user);
        }

        return result.Succeeded
            ? Result.Success()
            : Result.Failure(result.Errors.Select(e => Error.Create("Password", e.Description)));

    }

    public async Task<Result> LoginAsync(UserLoginRequest userLoginRequest)
    {
        var user = await _userManager.FindByNameAsync(userLoginRequest.UserName);

        if (user is null || !await _userManager.CheckPasswordAsync(user, userLoginRequest.Password))
        {
            var message = string.Format(ErrorMessages.LOGIN_FAILED, userLoginRequest.UserName);
            return Result.Failure(Error.Create(message));
        }

        await GenerateAndStoreTokens(user);

        return Result.Success();
    }

    public async Task<Result> RefreshTokenAsync(string? refreshToken)
    {
        if (string.IsNullOrEmpty(refreshToken))
        {
            return Result.Failure(Error.Create(ErrorMessages.MISSING_REFRESH_TOKEN));
        }

        var user = await _userRepository.GetUserByRefreshTokenAsync(refreshToken);

        if (user is null)
        {
            return Result.Failure(Error.Create(ErrorMessages.UNABLE_TO_RETRIEVE_USER_FOR_RT));
        }

        if (user.RefreshTokenExpiresAtUtc < TimeProvider.System.GetUtcNow().DateTime)
        {
            return Result.Failure(Error.Create(ErrorMessages.REFRESH_TOKEN_IS_EXPIRED));
        }

        await GenerateAndStoreTokens(user);

        return Result.Success();
    }

    private async Task GenerateAndStoreTokens(User user)
    {
        var (jwtToken, expirationDateInUtc) = await _authTokenProcessor.GenerateJwtToken(user);
        var refreshTokenValue = _authTokenProcessor.GenerateRefreshToken();

        // todo: get this from configuration
        var refreshTokenExpirationDateInUtc = _timeProvider.GetUtcDateTime().AddDays(refreshTokenValue.ExpirationTimeInDays);

        user.RefreshToken = refreshTokenValue.Token;
        user.RefreshTokenExpiresAtUtc = refreshTokenExpirationDateInUtc;

        await _userManager.UpdateAsync(user);

        _authTokenProcessor.WriteAuthTokenAsHeader("X-Access-Token", jwtToken, expirationDateInUtc);
        _authTokenProcessor.WriteAuthTokenAsHeader("X-Refresh-Token", user.RefreshToken,
            refreshTokenExpirationDateInUtc);
    }

    private async Task<IdentityResult> ValidatePasswordAsync(string password)
    {
        var validators = _userManager.PasswordValidators;
        var errors = new List<IdentityError>();

        foreach (var validator in validators)
        {
            var result = await validator.ValidateAsync(_userManager, null!, password);
            if (!result.Succeeded)
            {
                errors.AddRange(result.Errors);
            }
        }

        return errors.Count == 0 ? IdentityResult.Success : IdentityResult.Failed(errors.ToArray());
    }
}
