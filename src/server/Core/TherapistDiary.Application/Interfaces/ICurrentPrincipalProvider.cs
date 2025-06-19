namespace TherapistDiary.Application.Infrastructure;

using System.Security.Principal;

public interface ICurrentPrincipalProvider
{
    IPrincipal? GetCurrentPrincipal();

    string? GetUserName();
}
