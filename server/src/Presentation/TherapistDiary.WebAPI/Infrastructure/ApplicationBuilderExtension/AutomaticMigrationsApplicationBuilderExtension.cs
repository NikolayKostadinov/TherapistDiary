namespace TherapistDiary.WebAPI.Infrastructure.ApplicationBuilderExtension;

using System.Linq;
using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using TherapistDiary.Persistence;
using TherapistDiary.Persistence.Interfaces;

public static class AutomaticMigrationsApplicationBuilderExtension
{
    public static IApplicationBuilder ApplyMigrations(this IApplicationBuilder app, Assembly? seedAssembly)
    {
        using (var serviceScope = app.ApplicationServices.GetRequiredService<IServiceScopeFactory>().CreateScope())
        {
            var context = serviceScope.ServiceProvider.GetService<ApplicationDbContext>();
            var logger = serviceScope.ServiceProvider.GetService<ILogger<ApplicationDbContext>>();

            // Apply migrations with retry logic
            var maxRetries = 10;
            var delay = TimeSpan.FromSeconds(5);

            for (int i = 0; i < maxRetries; i++)
            {
                try
                {
                    logger?.LogInformation("Attempting to migrate database (attempt {Attempt}/{MaxRetries})", i + 1, maxRetries);
                    context!.Database.Migrate();
                    logger?.LogInformation("Database migration completed successfully");
                    break;
                }
                catch (Exception ex) when (i < maxRetries - 1)
                {
                    logger?.LogWarning(ex, "Database migration failed on attempt {Attempt}/{MaxRetries}. Retrying in {Delay} seconds...", i + 1, maxRetries, delay.TotalSeconds);
                    Thread.Sleep(delay);
                }
                catch (Exception ex)
                {
                    logger?.LogError(ex, "Database migration failed after {MaxRetries} attempts", maxRetries);
                    throw;
                }
            }

            // Seed data without execution strategy conflicts
            if (seedAssembly is not null)
            {
                var seederTypes = seedAssembly.GetTypes()
                    .Where(t => !t.IsInterface && typeof(ISeeder).IsAssignableFrom(t));

                foreach (var type in seederTypes)
                {
                    try
                    {
                        var service = serviceScope.ServiceProvider.GetService(type);
                        if (service is not null)
                        {
                            var seeder = (ISeeder)service;
                            logger?.LogInformation("Running seeder: {SeederType}", type.Name);
                            seeder.SeedAsync().GetAwaiter().GetResult();
                            logger?.LogInformation("Seeder {SeederType} completed successfully", type.Name);
                        }
                    }
                    catch (Exception ex)
                    {
                        logger?.LogError(ex, "Seeder {SeederType} failed", type.Name);
                        throw;
                    }
                }
            }
        }

        return app;
    }
}
