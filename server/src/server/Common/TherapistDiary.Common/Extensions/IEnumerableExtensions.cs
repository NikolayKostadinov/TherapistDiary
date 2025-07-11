namespace TherapistDiary.Common.Extensions;

public static class EnumerableExtensions
{
    public static IEnumerable<T> ForEach<T>(this IEnumerable<T> collection, Action<T> action)
    {
        foreach (var item in collection) action(item);

        return collection;
    }

    public static void RemoveRange<T>(this ICollection<T> collection, IEnumerable<T> collectionToRemove)
    {
        collectionToRemove.ForEach(item => { collection.Remove(item); });
    }

    public static bool IsEmptyOrNull<T>(this IEnumerable<T>? enumerable)
    {
        return enumerable is null || !enumerable.Any();
    }
}