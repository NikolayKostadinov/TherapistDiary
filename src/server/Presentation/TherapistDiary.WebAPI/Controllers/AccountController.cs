namespace TherapistDiary.WebAPI.Controllers;

using Abstract;
using Application.Contracts;
using Application.Requests;
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
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var result = await _accountService.RegisterAsync(request);
        return result.IsSuccess ? Ok() : HandleFailure(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var result = await _accountService.LoginAsync(request);
        return result.IsSuccess ? Ok() : HandleFailure(result);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var refreshToken = HttpContext.Request.Cookies["REFRESH_TOKEN"];
        var result = await _accountService.RefreshTokenAsync(refreshToken);
        return result.IsSuccess ? Ok() : HandleFailure(result);
    }
}
