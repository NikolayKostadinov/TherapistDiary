namespace TherapistDiary.WebAPI.Configuration;

using FluentValidation;
using Scrutor;
using WebAPI;

public class PersistenceServiceInstaller : IServiceInstaller
{
    public void Install(IServiceCollection services, IConfiguration configuration)
    {
        services
            .Scan(
                selector => selector
                    .FromAssemblies(Persistence.AssemblyReference.Assembly)
                    .AddClasses(false)
                    .UsingRegistrationStrategy(RegistrationStrategy.Skip)
                    .AsMatchingInterface()
                    .WithScopedLifetime());


        services.AddValidatorsFromAssembly(Persistence.AssemblyReference.Assembly, includeInternalTypes: true);
    }
}
