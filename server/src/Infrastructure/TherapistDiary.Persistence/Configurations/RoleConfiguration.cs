namespace TherapistDiary.Persistence.Configurations
{
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;
    using Domain.Entities;

    public class RoleConfiguration : IEntityTypeConfiguration<Role>
    {
        public void Configure(EntityTypeBuilder<Role> builder)
        {
            builder
                .Property(r=> r.Name)
                .HasMaxLength(256);

            // builder
            //     .HasMany(role => role.UserRoles)
            //     .WithOne(ur=>ur.Role)
            //     .HasForeignKey(ur => ur.RoleId)
            //     .OnDelete(DeleteBehavior.Restrict)
            //     .IsRequired();
        }
    }
}
