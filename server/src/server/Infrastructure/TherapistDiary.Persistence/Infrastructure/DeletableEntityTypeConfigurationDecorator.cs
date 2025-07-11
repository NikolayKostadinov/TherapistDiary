namespace TherapistDiary.Persistence.Infrastructure;

using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TherapistDiary.Domain.Primitives;

public class DeletableEntityTypeConfigurationDecorator<T> : IEntityTypeConfiguration<T>
    where T : class, IDeletableEntity
{
    private readonly IEntityTypeConfiguration<T> _configurator;

    public DeletableEntityTypeConfigurationDecorator(IEntityTypeConfiguration<T> configurator)
    {
        _configurator = configurator ?? throw new ArgumentNullException(nameof(configurator));
    }

    public void Configure(EntityTypeBuilder<T> builder)
    {
        _configurator.Configure(builder);
        builder.HasQueryFilter(p => !p.IsDeleted);
        builder.HasIndex(p => p.IsDeleted);
    }
}
