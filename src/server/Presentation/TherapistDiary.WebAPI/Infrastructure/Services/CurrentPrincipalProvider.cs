namespace TherapistDiary.WebAPI.Infrastructure.Services;

using System.Security.Principal;
using Microsoft.AspNetCore.Http;
using TherapistDiary.Application.Infrastructure;

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
