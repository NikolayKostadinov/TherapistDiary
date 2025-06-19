namespace TherapistDiary.Common.Extensions;

public static class TimeProviderExtensions
{
    public static DateTime GetUtcDateTime(this TimeProvider timeProvider)
    {
        return DateTime.SpecifyKind(timeProvider.GetUtcNow().DateTime, DateTimeKind.Utc);
    }

    public static DateTime GetLocalDateTime(this TimeProvider timeProvider)
    {
        return DateTime.SpecifyKind(timeProvider.GetUtcNow().ToLocalTime().DateTime, DateTimeKind.Local);
    }
}
