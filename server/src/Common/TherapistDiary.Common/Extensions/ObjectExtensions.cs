namespace TherapistDiary.Common.Extensions;

using System.Globalization;

public static class ObjectExtensions
{
    public static T CastTo<T>(this object obj)
    {
        var result = Activator.CreateInstance(typeof(T));

        foreach (var property in obj.GetType().GetProperties())
            try
            {
                result?.GetType().GetProperty(property.Name)?.SetValue(result, property.GetValue(obj));
            }
            catch
            {
            }

        return (T)result.EnsureNotEmpty(nameof(result));
    }

    public static T EnsureNotEmpty<T>(this T? inObj, string objName)
        where T : class
    {
        return inObj
               ?? throw new ArgumentNullException(objName);
    }

    public static decimal? ToNullableDecimal(this object? obj)
    {
        if (obj is null) return null;

        if (decimal.TryParse(obj.ToString(), out var d)) return d;

        var value = obj.ToString() ?? string.Empty;
        value = value.Replace(",", ".");
        if (decimal.TryParse(value, out var dd)) return dd;

        return null;
    }

    public static decimal? AsNullableDecimal(this object? obj)
    {
        if (obj == null || obj == DBNull.Value)
            return null;

        if (obj is decimal decimalValue)
            return decimalValue;

        var stringValue = obj.ToString() ?? string.Empty;
        stringValue = stringValue.Replace(",", ".");
        if (decimal.TryParse(stringValue, out var result))
            return result;

        if (decimal.TryParse(stringValue, NumberStyles.Number, CultureInfo.InvariantCulture, out result))
            return result;

        if (decimal.TryParse(stringValue, NumberStyles.Number, CultureInfo.GetCultureInfo("en-US"), out result))
            return result;

        if (decimal.TryParse(stringValue, NumberStyles.AllowExponent | NumberStyles.Float, CultureInfo.InvariantCulture,
                out result))
            return result;

        if (decimal.TryParse(stringValue, NumberStyles.AllowExponent | NumberStyles.Float,
                CultureInfo.GetCultureInfo("en-US"), out result))
            return result;

        return null;
    }
}