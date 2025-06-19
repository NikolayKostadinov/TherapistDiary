namespace TherapistDiary.Persistence.Infrastructure;

using System.Security.Principal;
using Application.Infrastructure;

public class DesignTimePrincipalProvider : ICurrentPrincipalProvider
{
    public IPrincipal GetCurrentPrincipal()
    {
        return Thread.CurrentPrincipal!;
    }

    public string? GetUserName()
    {
        return GetCurrentPrincipal()?.Identity?.Name;
    }
}
