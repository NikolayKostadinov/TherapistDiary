namespace TherapistDiary.Persistence.Configurations;

using Common.Constants;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Domain.Entities;

public class TherapyConfiguration : IEntityTypeConfiguration<Therapy>
{
    public void Configure(EntityTypeBuilder<Therapy> builder)
    {
        builder.ToTable("Therapies");

        builder
            .Property(p => p.Name)
            .HasMaxLength(GlobalConstants.Therapy.NameMaxLength);

        builder.HasOne(t => t.TherapyType)
            .WithMany(tt=>tt.Therapies)
            .HasForeignKey(ur => ur.TherapyTypeId);
    }
}
