namespace TherapistDiary.Common.Extensions;

using System.Globalization;
using System.Resources;

public static class ResourceManagerExtensions
{
    public static string GetLocalizedString(
        this ResourceManager resourceManager,
        string message,
        string culture)
    {
        return resourceManager.GetString(message, CultureInfo.GetCultureInfo(culture))
               ?? string.Empty;
    }
}