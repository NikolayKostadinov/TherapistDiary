namespace TherapistDiary.Domain.Primitives;

using System;

public interface IDeletableEntity: IAuditableEntity
{
    bool IsDeleted { get; set; }

    DateTime? DeletedOn { get; set; }

    string? DeletedFrom { get; set; }
}