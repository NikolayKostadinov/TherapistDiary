namespace TherapistDiary.Common.Extensions;

public static class CollectionExtensions
{
    public static ICollection<T> ForEach<T>(this ICollection<T> collection, Action<T> action)
    {
        foreach (var item in collection) action(item);
        return collection;
    }

    public static void AddRange<T>(this ICollection<T> collection, ICollection<T> collectionToAdd)
    {
        collectionToAdd.ForEach(item => { collection.Add(item); });
    }

    public static void RemoveRange<T>(this ICollection<T> collection, ICollection<T> collectionToRemove)
    {
        collectionToRemove.ForEach(item => { collection.Remove(item); });
    }
}