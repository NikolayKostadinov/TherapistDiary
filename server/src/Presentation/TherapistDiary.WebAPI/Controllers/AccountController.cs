namespace TherapistDiary.WebAPI.Controllers;

using System.ComponentModel.DataAnnotations;
using Abstract;
using Application.Contracts;
using Application.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

public class AccountController : ApiController
{
    private readonly IAccountService _accountService;

    public AccountController(ILogger<AccountController> logger, IAccountService accountService)
        : base(logger)
    {
        _accountService = accountService;
    }

    /// <summary>
    /// Retrieves a user by their unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier (GUID) of the user to retrieve.</param>
    /// <returns>An <see cref="IActionResult"/> containing the user details if successful,
    /// or the error details if the operation fails.</returns>
    [Authorize("AdminOrOwner")]
    [HttpGet("{id:guid:required}", Name = nameof(GetUserById))]
    public async Task<IActionResult> GetUserById([FromRoute] Guid id)
    {
        var result = await _accountService.GetUserById(id);
        return result.IsSuccess
            ? Ok(result.Value)
            : HandleFailure(result);
    }


    /// <summary>
    /// Registers a new user with the provided registration details.
    /// </summary>
    /// <param name="request">The <see cref="UserRegisterRequest"/> containing the user's registration details.</param>
    /// <returns>An <see cref="IActionResult"/> indicating whether the registration was successful
    /// or providing error details in case of failure.</returns>
    [HttpPost()]
    public async Task<IActionResult> Register(UserRegisterRequest request)
    {
        var result = await _accountService.RegisterAsync(request);
        return result.IsSuccess ? Ok() : HandleFailure(result);
    }

    /// <summary>
    /// Updates the details of an existing user.
    /// </summary>
    /// <param name="id">The unique identifier (GUID) of the user to update.</param>
    /// <param name="request">A <see cref="UserUpdateRequest"/> containing the updated user details.</param>
    /// <returns>An <see cref="IActionResult"/> indicating the result of the update operation.
    /// Returns an empty success response if the update is successful, or error details if it fails.</returns>
    [HttpPut("{id:guid:required}")]
    [Authorize("AdminOrOwner")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UserUpdateRequest request)
    {
        request.Id = id;
        var result = await _accountService.UpdateAsync(request);
        return result.IsSuccess ? Ok() : HandleFailure(result);
    }

    /// <summary>
    /// Deletes a user account based on the unique identifier (GUID).
    /// </summary>
    /// <param name="id">The unique identifier (GUID) of the user to delete.</param>
    /// <returns>An <see cref="IActionResult"/> indicating the success or failure
    /// of the delete operation, including any relevant error details if the operation fails.</returns>
    [HttpDelete("{id:guid:required}")]
    [Authorize("AdminOrOwner")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _accountService.DeleteAsync(id);
        return result.IsSuccess ? Ok() : HandleFailure(result);
    }

    /// <summary>
    /// Adds a user to a specified role.
    /// </summary>
    /// <param name="id">The unique identifier (GUID) of the user to be assigned the role.</param>
    /// <param name="role">The name of the role to add the user to.</param>
    /// <returns>An <see cref="IActionResult"/> indicating the result of the operation, either successful or containing error details.</returns>
    [HttpPatch("add-role/{id:guid:required}/{role:required}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> AddUserToRole(Guid id, string role)
    {
        var result = await _accountService.AddUserInRoleAsync(id.ToString(), role);
        return result.IsSuccess ? Ok() : HandleFailure(result);
    }

    /// <summary>
    /// Removes a user from a specified role.
    /// </summary>
    /// <param name="id">The unique identifier (GUID) of the user to be removed from the role.</param>
    /// <param name="role">The name of the role from which the user will be removed.</param>
    /// <returns>An <see cref="IActionResult"/> indicating the outcome of the operation.
    /// Returns success if the removal is complete or error details if the operation fails.</returns>
    [HttpPatch("remove-role/{id:guid:required}/{role:required}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> RemoveUserFromRole(Guid id, string role)
    {
        var result = await _accountService.RemoveUserFromRoleAsync(id.ToString(), role);
        return result.IsSuccess ? Ok() : HandleFailure(result);
    }

    /// <summary>
    /// Authenticates a user using their login credentials.
    /// </summary>
    /// <param name="request">The <see cref="UserLoginRequest"/> that contains the user's login credentials, including username and password.</param>
    /// <returns>An <see cref="IActionResult"/> containing the authentication result, including a success response with a token if the login is successful, or error details if the operation fails.</returns>
    /// <response code="200">Returns the authentication token and user information when login is successful</response>
    /// <response code="400">If the login request is invalid or malformed</response>
    /// <response code="401">If the provided credentials are incorrect</response>
    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(UserLoginRequest request)
    {
        var result = await _accountService.LoginAsync(request);
        return result.IsSuccess ? Ok() : HandleFailure(result);
    }

    /// <summary>
    /// Refreshes the user's authentication token using a provided refresh token.
    /// </summary>
    /// <returns>An <see cref="IActionResult"/> indicating the outcome of the refresh operation.
    /// Returns a new authentication token if successful, or an error response if the operation fails.</returns>
    /// <response code="200">Returns the new authentication token when refresh is successful</response>
    /// <response code="400">If the refresh token is missing or invalid</response>
    /// <response code="401">If the refresh token is expired or doesn't match any user</response>
    [HttpPost("refresh")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh()
    {
        var refreshToken = HttpContext.Request.Headers["X-Refresh-Token"].FirstOrDefault();

        if (string.IsNullOrEmpty(refreshToken))
        {
            return BadRequest("Refresh token is missing");
        }

        var result = await _accountService.RefreshTokenAsync(refreshToken);
        return result.IsSuccess ? Ok() : HandleFailure(result);
    }
}
