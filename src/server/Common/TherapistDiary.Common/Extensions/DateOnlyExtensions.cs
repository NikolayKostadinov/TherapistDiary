namespace TherapistDiary.Common.Extensions;

/// <summary>
/// DateOnly's extension methods
/// </summary>
public static class DateOnlyExtensions
{
    /// <summary>
    /// Gets the first day of the month for a given DateOnly.
    /// </summary>
    /// <param name="date"></param>
    /// <returns></returns>
    public static DateOnly GetFirstDayOfMonth(this DateOnly date)
    {
        return new DateOnly(date.Year, date.Month, 1);
    }

    /// <summary>
    /// Gets the last day of the month for a given DateOnly.
    /// </summary>
    /// <param name="date"></param>
    /// <returns></returns>
    public static DateOnly GetLastDayOfMonth(this DateOnly date)
    {
        var lastDay = DateTime.DaysInMonth(date.Year, date.Month);
        return new DateOnly(date.Year, date.Month, lastDay);
    }
}