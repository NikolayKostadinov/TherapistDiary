namespace TherapistDiary.Domain.Errors;

using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.Identity;
using Shared;

public static class DomainErrors
{
    private const string TO_VALIDATION_SUMMARY = "";


    public static Error IdentityError(IdentityResult result,
        string field = TO_VALIDATION_SUMMARY,
        [CallerMemberName] string methodName = "",
        [CallerFilePath] string sourceFilePath = "",
        [CallerLineNumber] int sourceLineNumber = 0
    )
    {
        var className = Path.GetFileNameWithoutExtension(sourceFilePath);
        var reason = $"{className}.{methodName}.{sourceLineNumber}";
        return new(field, reason,
            string.Join(", ",
                result.Errors
                    .Select(e => e.Code == "PasswordMismatch" ?
                            "Невалидни данни" :
                         e.Description
                    )));
    }
}

public enum Operations
{
    Create,
    Read,
    Update,
    Delete,
    Print
}
