namespace TherapistDiary.Domain.Shared;

using System.Runtime.CompilerServices;
using Errors;

public class Error : IEquatable<Error>
{
    private const string TO_VALIDATION_SUMMARY = "";

    public static readonly Error None = new(string.Empty, string.Empty, string.Empty);

    public static readonly Error NullValue = new("Error.NullValue", "Error.NullValue",
        "The specified result value is null.");


    public Error(string field, string location, string message)
    {
        Field = field;
        Location = location;
        Message = message;
    }

    public Error(string field, string message) : this(field, string.Empty, message)
    {
    }

    public Guid Id { get; init; } = Guid.CreateVersion7();

    public string Field { get; init; }

    public string Location { get; init; }

    public string Message { get; init; }

    public static implicit operator string(Error error) => error.Field;

    public static bool operator ==(Error? a, Error? b)
    {
        if (a is null && b is null)
        {
            return true;
        }

        if (a is null || b is null)
        {
            return false;
        }

        return a.Equals(b);
    }

    public static bool operator !=(Error? a, Error? b) => !(a == b);

    public virtual bool Equals(Error? other)
    {
        if (other is null)
        {
            return false;
        }

        return Field == other.Field && Message == other.Message;
    }

    public override bool Equals(object? obj) => obj is Error error && Equals(error);

    public override int GetHashCode() => HashCode.Combine(Field, Location, Message);

    public override string ToString() =>
        $"Id: {Id}; {(!string.IsNullOrEmpty(Field) ? "Field: " + Field + "; " : "")}" +
        $"{(!string.IsNullOrEmpty(Location) ? "Reason: " + Location + "; " : "")}" +
        $"Message: {Message}";

    public static Error Create(
        string message,
        string field = TO_VALIDATION_SUMMARY,
        Operations? operation = null,
        [CallerMemberName] string methodName = "",
        [CallerFilePath] string sourceFilePath = "",
        [CallerLineNumber] int sourceLineNumber = 0)
    {
        var className = Path.GetFileNameWithoutExtension(sourceFilePath);
        var notEmptyOperation = (operation is not null ? operation + "." : "");
        var location = $"{className}.{notEmptyOperation}{methodName}.{sourceLineNumber}";
        return new Error(field, location, message
        );
    }
}
