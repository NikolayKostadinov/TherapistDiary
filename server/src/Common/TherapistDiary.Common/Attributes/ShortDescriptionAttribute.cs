namespace TherapistDiary.Common.Attributes;

using System.ComponentModel;
using System.Diagnostics.CodeAnalysis;

/// <summary>
/// Specifies a description for a property or event.
/// </summary>
[AttributeUsage(AttributeTargets.All)]
public class ShortDescriptionAttribute : Attribute
{
    /// <summary>
    /// Specifies the default value for the <see cref='Common.Attributes.ShortDescriptionAttribute'/>,
    /// which is an empty string (""). This <see langword='static'/> field is read-only.
    /// </summary>
    public static readonly DescriptionAttribute Default = new DescriptionAttribute();

    public ShortDescriptionAttribute() : this(string.Empty)
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref='Common.Attributes.ShortDescriptionAttribute'/> class.
    /// </summary>
    public ShortDescriptionAttribute(string description)
    {
        DescriptionValue = description;
    }

    /// <summary>
    /// Gets the description stored in this attribute.
    /// </summary>
    public virtual string Description => DescriptionValue;

    /// <summary>
    /// Read/Write property that directly modifies the string stored in the description
    /// attribute. The default implementation of the <see cref="Description"/> property
    /// simply returns this value.
    /// </summary>
    protected string DescriptionValue { get; set; }

    public override bool Equals([NotNullWhen(true)] object? obj) =>
        obj is DescriptionAttribute other && other.Description == Description;

    public override int GetHashCode() => Description?.GetHashCode() ?? 0;

    public override bool IsDefaultAttribute() => Equals(Default);
}
