namespace TherapistDiary.WebAPI.Infrastructure.ApplicationBuilderExtension;

using System.Linq;
using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TherapistDiary.Persistence;
using TherapistDiary.Persistence.Interfaces;

public static class AutomaticMigrationsApplicationBuilderExtension
{
    public static IApplicationBuilder ApplyMigrations(this IApplicationBuilder app, Assembly? seedAssembly)
    {
        using (var serviceScope = app.ApplicationServices.GetRequiredService<IServiceScopeFactory>().CreateScope())
        {
            var context = serviceScope.ServiceProvider.GetService<ApplicationDbContext>();
            context!.Database.Migrate();
            if (seedAssembly is not null)
            {
                var seederTypes = seedAssembly.GetTypes()
                    .Where(t => !t.IsInterface && typeof(ISeeder).IsAssignableFrom(t));
               
                foreach (var type in seederTypes)
                {
                    var service = serviceScope.ServiceProvider.GetService(type);
                    if (service is not null)
                    {
                        var seeder = (ISeeder)service;
                        seeder.SeedAsync().GetAwaiter().GetResult();
                    }
                }
            }
        }

        return app;
    }
}
