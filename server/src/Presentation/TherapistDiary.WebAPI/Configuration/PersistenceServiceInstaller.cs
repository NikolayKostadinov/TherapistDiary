namespace TherapistDiary.WebAPI.Configuration;

using Domain.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Persistence;
using Persistence.Interceptors;
using Persistence.Seed;
using Scrutor;

public class PersistentServiceInstaller : IServiceInstaller
{
    public void Install(IServiceCollection services, IConfiguration configuration)
    {
        // Register Repositories
        services
            .Scan(
                scan => scan
                    .FromAssemblies(Persistence.AssemblyReference.Assembly)
                    .AddClasses(c => c.InNamespaces("TherapistDiary.Persistence.Repositories"), publicOnly: false)
                    .UsingRegistrationStrategy(RegistrationStrategy.Skip)
                    .AsMatchingInterface()
                    .WithScopedLifetime());

        // Register Interceptors
        services
            .Scan(
                scan => scan
                    .FromAssemblies(Persistence.AssemblyReference.Assembly)
                    .AddClasses(c => c.AssignableTo<IInterceptor>())
                    .AsImplementedInterfaces()
                    .WithSingletonLifetime());

        services.AddDbContextPool<ApplicationDbContext>(
            (sp, optionsBuilder) =>
            {
                var env = sp.GetService<IHostEnvironment>();

                // Check if running in container or production environment
                var isRunningInContainer = IsRunningInContainer();
                var isProduction = env!.IsProduction();

                var connectionString = (isRunningInContainer || isProduction)
                    ? Environment.GetEnvironmentVariable("DB_CONNECTION_STRING")
                    : configuration.GetConnectionString("Application_Db");

                optionsBuilder.UseSqlServer(connectionString);

                optionsBuilder.AddInterceptors(sp.GetServices<IInterceptor>().ToArray());

                optionsBuilder.ConfigureWarnings(w =>
                    w.Ignore(SqlServerEventId.SavepointsDisabledBecauseOfMARS));
            });

        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // ------------------------------- Global ISeed SetUp ------------------------------------------------------------
        services.AddScoped<ApplicationInitializer>();
        services.AddScoped<TherapiesSeed>();
        services.AddScoped<AppointmentSeed>();
    }

    private static bool IsRunningInContainer()
    {

        if (Environment.GetEnvironmentVariable("RUNNING_IN_CONTAINER") == "true")
            return true;

        if (Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true")
            return true;

        return File.Exists("/.dockerenv");
    }
}
