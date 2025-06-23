namespace TherapistDiary.Application.Services;

using Contracts;
using Domain.Entities;
using Domain.Repositories;
using Domain.Resources;
using Domain.Shared;
using Microsoft.AspNetCore.Identity;
using Requests;
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

    public async Task<Result> RegisterAsync(RegisterRequest registerRequest)
    {
        var userExist = await _userManager.FindByNameAsync(registerRequest.UserName) is not null;
        if (userExist)
        {
            var message = string.Format(ErrorMessages.USER_ALREADY_EXISTS, registerRequest.UserName);
            return Result.Failure(Error.Create(message));
        }

        var user = User.Create(
            registerRequest.UserName,
            registerRequest.Email,
            registerRequest.FirstName,
            registerRequest.LastName,
            registerRequest.MidName);

        var passwordValidationResult = await ValidatePasswordAsync(registerRequest.Password);
        if (!passwordValidationResult.Succeeded)
        {
            return Result.Failure(IdentityError(passwordValidationResult, nameof(registerRequest.Password)));
        }

        user.PasswordHash = _userManager.PasswordHasher.HashPassword(user, registerRequest.Password);


        var result = await _userManager.CreateAsync(user);

        return result.Succeeded
            ? Result.Success()
            : Result.Failure(IdentityError(result));
    }

    public async Task<Result> LoginAsync(LoginRequest loginRequest)
    {
        var user = await _userManager.FindByNameAsync(loginRequest.UserName);

        if (user is null || !await _userManager.CheckPasswordAsync(user, loginRequest.Password))
        {
            var message = string.Format(ErrorMessages.LOGIN_FAILED, loginRequest.UserName);
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
        var (jwtToken, expirationDateInUtc) = _authTokenProcessor.GenerateJwtToken(user);
        var refreshTokenValue = _authTokenProcessor.GenerateRefreshToken();

        // todo: get this from configuration
        var refreshTokenExpirationDateInUtc = _timeProvider.GetUtcDateTime().AddDays(7);

        user.RefreshToken = refreshTokenValue;
        user.RefreshTokenExpiresAtUtc = refreshTokenExpirationDateInUtc;

        await _userManager.UpdateAsync(user);

        _authTokenProcessor.WriteAuthTokenAsHttpOnlyCookie("ACCESS_TOKEN", jwtToken, expirationDateInUtc);
        _authTokenProcessor.WriteAuthTokenAsHttpOnlyCookie("REFRESH_TOKEN", user.RefreshToken,
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
