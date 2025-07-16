namespace TherapistDiary.WebAPI.Controllers;

using System.ComponentModel.DataAnnotations;
using Abstract;
using Application.Contracts;
using Application.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

public class AccountController: ApiController
{
    private readonly IAccountService _accountService;

    public AccountController(ILogger<AccountController> logger, IAccountService accountService)
        : base(logger)
    {
        _accountService = accountService;

    }

    [HttpPost("regiser")]
    public async Task<IActionResult> Register(UserRegisterRequest request)
    {
        var result = await _accountService.RegisterAsync(request);
        return result.IsSuccess ? Ok() : HandleFailure(result);
    }

    [HttpPut("update/{id:guid:required}")]
    [Authorize("AdminOrOwner")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UserUpdateRequest request)
    {
        request.Id = id;
        var result = await _accountService.UpdateAsync(request);
        return result.IsSuccess ? Ok() : HandleFailure(result);
    }

    [HttpDelete("delete/{id:guid:required}")]
    [Authorize("AdminOrOwner")]
    public async Task<IActionResult> Delete( Guid id, [FromBody] UserUpdateRequest request)
    {
        request.Id = id;
        var result = await _accountService.UpdateAsync(request);
        return result.IsSuccess ? Ok() : HandleFailure(result);
    }

    [HttpPatch("add-role/{id:guid:required}/{role:required}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> AddUserToRole(Guid id, string role)
    {
        var result = await _accountService.AddUserInRoleAsync(id.ToString(), role);
        return result.IsSuccess ? Ok() : HandleFailure(result);
    }

    [HttpPatch("remove-role/{id:guid:required}/{role:required}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> RemoveUserFromRole(Guid id, string role)
    {
        var result = await _accountService.RemoveUserFromRoleAsync(id.ToString(), role);
        return result.IsSuccess ? Ok() : HandleFailure(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(UserLoginRequest request)
    {
        var result = await _accountService.LoginAsync(request);
        return result.IsSuccess ? Ok() : HandleFailure(result);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var refreshToken = HttpContext.Request.Headers["X-Refresh-Token"];
        var result = await _accountService.RefreshTokenAsync(refreshToken);
        return result.IsSuccess ? Ok() : HandleFailure(result);
    }
}
