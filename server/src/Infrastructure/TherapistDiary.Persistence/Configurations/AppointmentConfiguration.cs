namespace TherapistDiary.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class AppointmentConfiguration: IEntityTypeConfiguration<Appointment>
{
    public void Configure(EntityTypeBuilder<Appointment> builder)
    {
        builder.ToTable("Appointment");

        builder
            .HasOne(a => a.Therapist)
            .WithMany()
            .HasForeignKey(a=>a.TherapistId)
            .IsRequired();

        builder
            .HasOne(a => a.TherapyType)
            .WithMany()
            .HasForeignKey(a=>a.TherapyTypeId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired();

        builder
            .HasOne(a => a.Patient)
            .WithMany()
            .HasForeignKey(a=>a.PatientId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired();

        builder
            .HasOne(a => a.Therapist)
            .WithMany()
            .HasForeignKey(a=>a.TherapistId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired();
    }
}
