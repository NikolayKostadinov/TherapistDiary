namespace TherapistDiary.Application.Interfaces;

using System.Security.Principal;

public interface ICurrentPrincipalProvider
{
    IPrincipal? GetCurrentPrincipal();

    string? GetUserName();
}
