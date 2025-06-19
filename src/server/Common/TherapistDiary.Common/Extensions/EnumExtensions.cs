namespace TherapistDiary.Common.Extensions;

using System.ComponentModel;
using Attributes;

public static class EnumExtensions
{
    /// <summary>
    /// Gets description attribute of the enumeration member
    /// </summary>
    /// <param name="enumValue">The enumeration value</param>
    /// <returns>The value of the description attribute</returns>
    /// <exception cref="ArgumentException">If DescriptionAttribute not found!</exception>
    public static string GetDescription(this Enum enumValue)
    {
        var field = enumValue.GetType().GetField(enumValue.ToString());

        if (field is not null
            && Attribute.GetCustomAttribute(field, typeof(DescriptionAttribute)) is DescriptionAttribute attribute)
        {
            return attribute.Description;
        }

        throw new ArgumentException("Item not found.", nameof(enumValue));
    }

    /// <summary>
    /// Gets description attribute of the enumeration member
    /// </summary>
    /// <param name="enumValue">The enumeration value</param>
    /// <returns>The value of the description attribute</returns>
    /// <exception cref="ArgumentException">If DescriptionAttribute not found!</exception>
    public static string GetShortDescription(this Enum enumValue)
    {
        var field = enumValue.GetType().GetField(enumValue.ToString());

        if (field is not null
            && Attribute.GetCustomAttribute(field, typeof(ShortDescriptionAttribute)) is ShortDescriptionAttribute attribute)
        {
            return attribute.Description;
        }

        throw new ArgumentException("Item not found.", nameof(enumValue));
    }
}
