namespace TherapistDiary.Domain.Entities;

using Microsoft.AspNetCore.Identity;

public class Role: IdentityRole<Guid>
{
    public Role()
    {
        UserRoles = new HashSet<UserRole>();
    }

    public Role(string name)
        :this()
    {
        Name = name;
    }

    public virtual ICollection<UserRole> UserRoles { get; set; }

}
