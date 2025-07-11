namespace TherapistDiary.Persistence.Configurations;

using Common.Constants;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Domain.Entities;

public class TherapyTypeConfiguration : IEntityTypeConfiguration<TherapyType>
{
    public void Configure(EntityTypeBuilder<TherapyType> builder)
    {
        builder.ToTable("TherapyTypes");
        
        builder
            .Property(t => t.Name)
            .HasMaxLength(GlobalConstants.Therapy.NameMaxLength);

        builder.HasMany(tt => tt.Therapies)
            .WithOne(t=>t.TherapyType)
            .HasForeignKey(ur => ur.TherapyTypeId);
    }
}
