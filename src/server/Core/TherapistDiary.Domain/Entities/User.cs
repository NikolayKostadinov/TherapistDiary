namespace TherapistDiary.Domain.Entities;

using Microsoft.AspNetCore.Identity;

public class User : IdentityUser<Guid>
{
    public required string FirstName { get; set; }
    public string? MidName { get; set; }
    public required string LastName { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiresAtUtc { get; set; }


    public static User Create(string userName, string email, string firstName, string lastName, string? midName = null)
    {
        return new User
        {
            UserName = userName,
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            MidName = midName
        };
    }

    public override string ToString() => GetFullName();

    private string GetFullName()
    {
        var middlePart = string.IsNullOrEmpty(MidName) ? "" : $" {MidName}";
        return FirstName + middlePart + " " + LastName;
    }
}
