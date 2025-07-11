namespace TherapistDiary.Persistence;

using System.Diagnostics.CodeAnalysis;
using Infrastructure;
using Microsoft.EntityFrameworkCore;

[ExcludeFromCodeCoverage]
public class ApplicationDbContextFactory : DesignTimeDbContextFactoryBase<ApplicationDbContext>
{
    protected override ApplicationDbContext CreateNewInstance(DbContextOptions<ApplicationDbContext> options)
    {
        return new ApplicationDbContext(options);
    }
}
