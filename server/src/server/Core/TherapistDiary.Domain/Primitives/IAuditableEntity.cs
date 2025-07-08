namespace TherapistDiary.Domain.Primitives;

using System;

public interface IAuditableEntity
{
    DateTime CreatedOn { get; set; }

    bool PreserveCreatedOn { get; set; }

    DateTime? ModifiedOn { get; set; }

    string CreatedFrom { get; set; }

    string? ModifiedFrom { get; set; }
}