namespace TherapistDiary.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Domain.Entities;

public class PatientConfiguration : IEntityTypeConfiguration<Patient>
{
    public void Configure(EntityTypeBuilder<Patient> builder)
    {
        builder.ToTable("Patients");
        builder
            .Property(p => p.FirstName)
            .HasMaxLength(256);
        builder
            .Property(p => p.MidName)
            .HasMaxLength(256);
        builder
            .Property(p => p.LastName)
            .HasMaxLength(256);
        builder
            .Property(p => p.Age)
            .IsRequired();
        builder
            .Property(p => p.PhoneNumber)
            .HasMaxLength(20)
            .IsRequired();
    }
}
