namespace TherapistDiary.WebAPI.Infrastructure.Services;

using System.Security.Principal;
using Application.Contracts;
using Microsoft.AspNetCore.Http;

public class CurrentPrincipalProvider : ICurrentPrincipalProvider
{
    private readonly IHttpContextAccessor _httpContext;

    public CurrentPrincipalProvider(IHttpContextAccessor httpContextParam)
    {
        _httpContext = httpContextParam;
    }

    public IPrincipal GetCurrentPrincipal()
    {
        // todo: Check for null (may be later!)
        return _httpContext.HttpContext?.User!;
    }

    public string? GetUserName()
    {
        var currentPrincipal = GetCurrentPrincipal();
        return currentPrincipal?.Identity?.Name;
    }
}
