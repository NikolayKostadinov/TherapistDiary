namespace TherapistDiary.WebAPI.Infrastructure.Identity;

using Microsoft.AspNetCore.Identity;
using System.Resources;
using System.Reflection;
using TherapistDiary.Domain.Resources;

public class BulgarianIdentityErrorDescriber : IdentityErrorDescriber
{
    private readonly ResourceManager _resourceManager;

    public BulgarianIdentityErrorDescriber()
    {
        // Specify the resource file to use for error messages
        _resourceManager = new ResourceManager(
            "TherapistDiary.Domain.Resources.IdentityErrorMessages",
            typeof(ErrorMessages).Assembly);
    }

    public override IdentityError DefaultError() => new IdentityError
    {
        Code = nameof(DefaultError),
        Description = GetLocalizedString("DefaultError", "Възникна неизвестна грешка.")
    };

    public override IdentityError ConcurrencyFailure() => new IdentityError
    {
        Code = nameof(ConcurrencyFailure),
        Description = GetLocalizedString("ConcurrencyFailure", "Обектът е модифициран.")
    };

    public override IdentityError PasswordMismatch() => new IdentityError
    {
        Code = nameof(PasswordMismatch),
        Description = GetLocalizedString("PasswordMismatch", "Грешна парола.")
    };

    public override IdentityError InvalidToken() => new IdentityError
    {
        Code = nameof(InvalidToken),
        Description = GetLocalizedString("InvalidToken", "Невалиден токен.")
    };

    public override IdentityError LoginAlreadyAssociated() => new IdentityError
    {
        Code = nameof(LoginAlreadyAssociated),
        Description = GetLocalizedString("LoginAlreadyAssociated", "Потребител с този вход вече съществува.")
    };

    public override IdentityError InvalidUserName(string userName) => new IdentityError
    {
        Code = nameof(InvalidUserName),
        Description = string.Format(GetLocalizedString("InvalidUserName", "Потребителското име '{0}' е невалидно, може да съдържа само букви и цифри."), userName)
    };

    public override IdentityError InvalidEmail(string email) => new IdentityError
    {
        Code = nameof(InvalidEmail),
        Description = string.Format(GetLocalizedString("InvalidEmail", "Имейлът '{0}' е невалиден."), email)
    };

    public override IdentityError DuplicateUserName(string userName) => new IdentityError
    {
        Code = nameof(DuplicateUserName),
        Description = string.Format(GetLocalizedString("DuplicateUserName", "Потребителското име '{0}' вече е заето."), userName)
    };

    public override IdentityError DuplicateEmail(string email) => new IdentityError
    {
        Code = nameof(DuplicateEmail),
        Description = string.Format(GetLocalizedString("DuplicateEmail", "Имейлът '{0}' вече е регистриран."), email)
    };

    public override IdentityError PasswordTooShort(int length) => new IdentityError
    {
        Code = nameof(PasswordTooShort),
        Description = string.Format(GetLocalizedString("PasswordTooShort", "Паролата трябва да бъде поне {0} символа."), length)
    };

    public override IdentityError PasswordRequiresNonAlphanumeric() => new IdentityError
    {
        Code = nameof(PasswordRequiresNonAlphanumeric),
        Description = GetLocalizedString("PasswordRequiresNonAlphanumeric", "Паролата трябва да съдържа поне един специален символ.")
    };

    public override IdentityError PasswordRequiresDigit() => new IdentityError
    {
        Code = nameof(PasswordRequiresDigit),
        Description = GetLocalizedString("PasswordRequiresDigit", "Паролата трябва да съдържа поне една цифра ('0'-'9').")
    };

    public override IdentityError PasswordRequiresLower() => new IdentityError
    {
        Code = nameof(PasswordRequiresLower),
        Description = GetLocalizedString("PasswordRequiresLower", "Паролата трябва да съдържа поне една малка буква ('a'-'z').")
    };

    public override IdentityError PasswordRequiresUpper() => new IdentityError
    {
        Code = nameof(PasswordRequiresUpper),
        Description = GetLocalizedString("PasswordRequiresUpper", "Паролата трябва да съдържа поне една главна буква ('A'-'Z').")
    };

    public override IdentityError PasswordRequiresUniqueChars(int uniqueChars) => new IdentityError
    {
        Code = nameof(PasswordRequiresUniqueChars),
        Description = string.Format(GetLocalizedString("PasswordRequiresUniqueChars", "Паролата трябва да съдържа поне {0} различни символа."), uniqueChars)
    };

    private string GetLocalizedString(string resourceKey, string defaultValue)
    {
        string? localizedString = _resourceManager.GetString(resourceKey);
        return localizedString ?? defaultValue;
    }
}
