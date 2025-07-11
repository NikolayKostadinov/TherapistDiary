namespace TherapistDiary.Application.Infrastructure.AutoMapper;

using System;

public static class ObjectMappingExtensions
{
    public static TDestination To<TDestination>(
        this object source)
    {
        if (source == null) throw new ArgumentNullException(nameof(source));

        return AutoMapperConfig.MapperInstance.Map<TDestination>(source);
    }

    public static void MapTo<TDestination>(
        this object source,
        TDestination destination)
    {
        if (source == null) throw new ArgumentNullException(nameof(source));

        if (destination == null) throw new ArgumentNullException(nameof(destination));

        AutoMapperConfig.MapperInstance.Map(source, destination, source.GetType(), destination.GetType());
    }
}
