namespace TherapistDiary.Common.Extensions;

public static class DictionaryExtensions
{
    public static void ForEach<TKey, TValue>(this IDictionary<TKey, TValue> dictionary,
        Action<KeyValuePair<TKey, TValue>> action)
    {
        foreach (var entry in dictionary) action(entry);
    }
}