namespace TherapistDiary.WebAPI.Configuration;

using System.Net.Mime;
using AutoMapper;
using TherapistDiary.Application.Infrastructure.AutoMapper;

public class AutomapperServiceInstaller:IServiceInstaller
{
    public void Install(IServiceCollection services, IConfiguration configuration)
    {
        
        services.AddSingleton<IMapper>(options => AutoMapperConfig.MapperInstance);
        AutoMapperConfig.RegisterMappings(
            Application.AssemblyReference.Assembly,
            Domain.AssemblyReference.Assembly,
            Persistence.AssemblyReference.Assembly,
            AssemblyReference.Assembly);
    }
}
