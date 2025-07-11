namespace TherapistDiary.Application.Contracts;

using System.Security.Principal;

public interface ICurrentPrincipalProvider
{
    IPrincipal? GetCurrentPrincipal();

    string? GetUserName();
}
