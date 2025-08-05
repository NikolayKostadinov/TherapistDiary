namespace TherapistDiary.Domain.Entities;

using Microsoft.AspNetCore.Identity;
using Primitives;
using Shared;

public class User : IdentityUser<Guid>, IDeletableEntity
{
    public User()
    {
        UserRoles = new HashSet<UserRole>();
    }

    public required string FirstName { get; set; }
    public string? MidName { get; set; }
    public required string LastName { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiresAtUtc { get; set; }
    public string? Specialty { get; set; }
    public string? Biography { get; set; }
    public string? ProfilePictureUrl { get; set; }

    // IDeletableEntity properties
    public bool IsDeleted { get; set; }
    public DateTime? DeletedOn { get; set; }
    public string? DeletedFrom { get; set; }

    // IAuditableEntity properties  
    public DateTime CreatedOn { get; set; }
    public bool PreserveCreatedOn { get; set; }
    public DateTime? ModifiedOn { get; set; }
    public string CreatedFrom { get; set; } = string.Empty;
    public string? ModifiedFrom { get; set; }

    public string FullName => GetFullName();

    public virtual ICollection<UserRole> UserRoles { get; set; }

    public static User Create(string userName, string email, string firstName, string lastName,
        string? midName = null, string? phoneNumber = null, string? specialty = null, string? biography = null, string? profilePictureUrl = null)
    {
        return new User
        {
            UserName = userName,
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            MidName = midName,
            PhoneNumber = phoneNumber,
            Specialty = specialty,
            Biography = biography,
            ProfilePictureUrl = profilePictureUrl
        };
    }

    public void Update(string email, string firstName, string lastName,
        string? midName = null, string? phoneNumber = null, string? specialty = null, string? biography = null, string? profilePictureUrl = null)
    {
        Email = email;
        FirstName = firstName;
        LastName = lastName;
        MidName = midName;
        PhoneNumber = phoneNumber;
        Specialty = specialty;
        Biography = biography;
        ProfilePictureUrl = profilePictureUrl;
    }

    public override string ToString() => GetFullName();

    private string GetFullName()
    {
        var middlePart = string.IsNullOrEmpty(MidName) ? "" : $" {MidName}";
        return FirstName + middlePart + " " + LastName;
    }
}
