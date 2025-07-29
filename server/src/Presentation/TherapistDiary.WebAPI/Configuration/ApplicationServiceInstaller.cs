namespace TherapistDiary.WebAPI.Configuration;

using Application.Contracts;
using Application.Services;
using FluentValidation;
using Infrastructure.Services;
using Scrutor;

public class ApplicationServiceInstaller : IServiceInstaller
{
    public void Install(IServiceCollection services, IConfiguration configuration)
    {
        services
            .Scan(
                selector => selector
                    .FromAssemblies(
                        Application.AssemblyReference.Assembly,
                        TherapistDiary.Infrastructure.AssemblyReference.Assembly)
                    .AddClasses(false)
                    .UsingRegistrationStrategy(RegistrationStrategy.Skip)
                    .AsMatchingInterface((serviceType, implementationType) =>
                    {
                        // Логирайте регистрираните интерфейси
                        Console.WriteLine($"Registering: {implementationType.ToString()} as {serviceType.Name}");
                    })

                    .WithScopedLifetime());


        services.AddValidatorsFromAssembly(AssemblyReference.Assembly, includeInternalTypes: true);

        services.AddSingleton<ICurrentPrincipalProvider, CurrentPrincipalProvider>();
        services.AddSingleton<IBusinessHoursService, BusinessHourService>();
    }
}
