// ------------------------------------------------------------------------------------------------
//  <copyright file="UserRole.cs" company="Business Management System Ltd.">
//      Copyright "2021" (c), Business Management System Ltd.
//      All rights reserved.
//  </copyright>
//  <author>Nikolay.Kostadinov</author>
// ------------------------------------------------------------------------------------------------

namespace TherapistDiary.Domain.Entities;

using Microsoft.AspNetCore.Identity;

public class UserRole : IdentityUserRole<Guid>
{
    public virtual User User { get; set; } = null!;

    public virtual Role Role { get; set; } = null!;
}
