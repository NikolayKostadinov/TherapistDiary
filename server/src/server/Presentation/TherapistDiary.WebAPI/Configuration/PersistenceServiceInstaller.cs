namespace TherapistDiary.WebAPI.Configuration;

using Domain.Infrastructure;
using global::Persistence.Seed;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Persistence;
using Persistence.Interceptors;
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
                var connectionString = env!.IsProduction()
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
    }
}
