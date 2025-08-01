namespace TherapistDiary.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class AppointmentConfiguration: IEntityTypeConfiguration<Appointment>
{
    public void Configure(EntityTypeBuilder<Appointment> builder)
    {
        builder.ToTable("Appointment");

        builder.Property(a => a.Notes)
            .HasColumnType("nvarchar(max)")
            ;

        builder.Property(a => a.TherapistNotes)
            .HasColumnType("nvarchar(max)");

        builder
            .HasOne(a => a.Therapist)
            .WithMany()
            .HasForeignKey(a=>a.TherapistId)
            .IsRequired();

        builder
            .HasOne(a => a.Therapy)
            .WithMany()
            .HasForeignKey(a=>a.TherapyId)
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
