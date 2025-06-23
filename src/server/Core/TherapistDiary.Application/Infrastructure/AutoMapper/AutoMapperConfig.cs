namespace TherapistDiary.Application.Infrastructure.AutoMapper;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using global::AutoMapper;
using global::AutoMapper.Internal;

public static class AutoMapperConfig
{
    private static readonly object LockObj = new object();
    private static bool s_initialized;

    public static IMapper MapperInstance { get; set; } = null!;

    public static void RegisterMappings(
        params Assembly[] assemblies)
    {
        if (s_initialized)
        {
            return;
        }

        lock (LockObj)
        {
            if (s_initialized)
            {
                return;
            }

            s_initialized = true;

            var types = assemblies.SelectMany(a => a.GetExportedTypes()).ToList();

            var config = new MapperConfigurationExpression();
            config.CreateProfile(
                "ReflectionProfile",
                configuration =>
                {
                    foreach (var map in GetFromMaps(types))
                    {
                        configuration.CreateMap(map.Source, map.Destination);
                    }

                    foreach (var map in GetToMaps(types))
                    {
                        configuration.CreateMap(map.Source, map.Destination);
                    }

                    foreach (var map in GetCustomMappings(types))
                    {
                        map.CreateMappings(configuration);
                    }
                });

            var profileTypes = assemblies
                .SelectMany(a => a.GetExportedTypes())
                .Where(t => t.GetTypeInheritance().Any(it => it == typeof(Profile)))
                .Select(t => (Profile)Activator.CreateInstance(t)!)
                .ToList();

            config.AddProfiles(profileTypes);

            MapperInstance = new Mapper(new MapperConfiguration(config));
        }
    }

    private static IEnumerable<IHaveCustomMappings> GetCustomMappings(IEnumerable<Type> types)
    {
        var customMaps = from t in types
            from i in t.GetTypeInfo().GetInterfaces()
            where typeof(IHaveCustomMappings).GetTypeInfo().IsAssignableFrom(t)
                  && !t.GetTypeInfo().IsAbstract && !t.GetTypeInfo().IsInterface
            select (IHaveCustomMappings)Activator.CreateInstance(t)!;

        return customMaps;
    }

    private static IEnumerable<TypesMap> GetFromMaps(IEnumerable<Type> types)
    {
        var fromMaps = from t in types
            from i in t.GetTypeInfo().GetInterfaces()
            where i.GetTypeInfo().IsGenericType && i.GetGenericTypeDefinition() == typeof(IMapFrom<>)
                                                && !t.GetTypeInfo().IsAbstract
                                                && !t.GetTypeInfo().IsInterface
            select new TypesMap { Source = i.GetTypeInfo().GetGenericArguments()[0], Destination = t };

        return fromMaps;
    }

    private static IEnumerable<TypesMap> GetToMaps(IEnumerable<Type> types)
    {
        var toMaps = from t in types
            from i in t.GetTypeInfo().GetInterfaces()
            where i.GetTypeInfo().IsGenericType
                  && i.GetTypeInfo().GetGenericTypeDefinition() == typeof(IMapTo<>)
                  && !t.GetTypeInfo().IsAbstract && !t.GetTypeInfo().IsInterface
            select new TypesMap { Source = t, Destination = i.GetTypeInfo().GetGenericArguments()[0] };

        return toMaps;
    }

    private class TypesMap
    {
        public Type Destination { get; set; } = null!;

        public Type Source { get; set; } = null!;
    }
}
