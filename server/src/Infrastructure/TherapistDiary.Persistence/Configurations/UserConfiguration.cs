namespace TherapistDiary.Persistence.Configurations
{
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;
    using Domain.Entities;

    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder
                .Property(u => u.FirstName)
                .HasMaxLength(256);
            builder
                .Property(u => u.LastName)
                .HasMaxLength(256);
            builder
                .Property(u => u.Specialty)
                .HasMaxLength(256);

            builder
                .Property(u => u.Biography)
                .HasMaxLength(600);

            builder.Ignore(u => u.FullName);
        }
    }
}
