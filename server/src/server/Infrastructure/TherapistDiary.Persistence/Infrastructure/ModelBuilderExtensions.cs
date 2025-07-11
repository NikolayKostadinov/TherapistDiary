namespace TherapistDiary.Persistence.Infrastructure;

using System;
using System.Linq;
using System.Reflection;
using Domain.Primitives;
using Microsoft.EntityFrameworkCore;

public static class ModelBuilderExtensions
{
    public static void ApplyDeletableConfiguration(this ModelBuilder modelBuilder, Assembly assembly)
    {
        var configuratorTypes = assembly.GetTypes().Where(
            type => type.GetInterface(typeof(IEntityTypeConfiguration<>).FullName!) is not null);

        MethodInfo applyConfigurationMethod =
            typeof(ModelBuilder).GetMethods()
                .Single(
                    e =>
                    {
                        if (e.Name == "ApplyConfiguration" && e.ContainsGenericParameters)
                        {
                            return e.GetParameters().SingleOrDefault()?.ParameterType.GetGenericTypeDefinition()
                                   == typeof(IEntityTypeConfiguration<>);
                        }

                        return false;
                    });

        foreach (var configuratorType in configuratorTypes.Where(t => t != typeof(EntityTypeConfigurationDecorator<>) && t != typeof(DeletableEntityTypeConfigurationDecorator<>)))
        {
            var configurator = CreateConfigurator(configuratorType);

            Type[] interfaces = configuratorType.GetInterfaces();
            foreach (Type type in interfaces)
            {
                if (type.IsGenericType)
                {
                    if (type.GetGenericTypeDefinition() == typeof(IEntityTypeConfiguration<>))
                    {
                        applyConfigurationMethod.MakeGenericMethod(type.GenericTypeArguments[0])
                            .Invoke(modelBuilder, new[] { configurator });
                    }
                }
            }
        }
    }

    private static object CreateConfigurator(Type configuratorType)
    {
        var typeArgs = 
            new[] { configuratorType.GetInterfaces().First(i => i.IsGenericType).GetGenericArguments().First() };
        
        var fullName = typeof(IDeletableEntity).FullName ?? string.Empty;

        if (typeArgs[0].GetInterface(fullName) is null
            || !IsNonRootConfiguration(configuratorType))
        {
            return Activator.CreateInstance(configuratorType)!;
        }
        
        var configurationDecoratorType = typeof(DeletableEntityTypeConfigurationDecorator<>);
        var configurationDecorator = configurationDecoratorType.MakeGenericType(typeArgs);
        var configuration = Activator.CreateInstance(configuratorType);
        
        return Activator.CreateInstance(configurationDecorator, new[]{configuration})!;

    }

    private static bool IsNonRootConfiguration(Type configuratorType)
    {
        return configuratorType.GetCustomAttributes(true).All(x => x.GetType() != typeof(NonRootConfigurationAttribute));
    }

    /// <summary>
    /// Applies the global decimal type configuration.
    /// </summary>
    /// <param name="modelBuilder">The model builder.</param>
    /// <param name="precision">The precision.</param>
    /// <param name="scale">The scale.</param>
    public static void ApplyDecimalTypeConfiguration(this ModelBuilder modelBuilder, int precision, int scale)
    {
        foreach (var property in modelBuilder.Model.GetEntityTypes()
                     .SelectMany(x => x.GetProperties())
                     .Where(x => x.ClrType == typeof(decimal)))
        {
            property.SetColumnType($"decimal({precision},{scale})");
        }
    }
}
