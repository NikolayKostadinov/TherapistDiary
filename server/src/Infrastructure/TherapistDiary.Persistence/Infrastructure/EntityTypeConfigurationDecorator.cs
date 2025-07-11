namespace TherapistDiary.Persistence.Infrastructure;

using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TherapistDiary.Domain.Primitives;

public class EntityTypeConfigurationDecorator<T> : IEntityTypeConfiguration<T>
    where T : class
{
    private readonly IEntityTypeConfiguration<T> _configurator;

    public EntityTypeConfigurationDecorator(IEntityTypeConfiguration<T> configurator)
    {
        _configurator = configurator ?? throw new ArgumentNullException(nameof(configurator));
    }

    public void Configure(EntityTypeBuilder<T> builder)
    {
        _configurator.Configure(builder);
        
        // todo: Is there simpler way to check if class implements interface???
        var fullName = typeof(IDeletableEntity).FullName;
        if (fullName != null &&
            typeof(T).GetInterface(fullName) is not null &&
            _configurator.GetType().GetCustomAttributes(true).All(x => x.GetType() != typeof(NonRootConfigurationAttribute)))
        {
            builder.HasQueryFilter(p => !EF.Property<bool>(p, "IsDeleted"));
        }
    }
}
