namespace TherapistDiary.Domain.Shared;

using System.Text.Json.Serialization;

public class Result
{
    private readonly List<Error> _errors;
    protected Result(IEnumerable<Error> errors)
    {
        _errors = errors.ToList();
    }

    public bool IsSuccess => !_errors.Any();

    public bool IsFailure => _errors.Any();

    public IReadOnlyList<Error> Errors => _errors;

    public string ErrorsDetails => string.Join(Environment.NewLine, _errors.Select(err => err.ToString()));

    public static Result Success() => new(Array.Empty<Error>());

    public static Result<TValue> Success<TValue>(TValue value) => new(value, true, Array.Empty<Error>());

    public static Result Failure(IEnumerable<Error> errors) => new(errors);
    public static Result Failure(Error error) => new(new []{error});

    public static Result<TValue> Failure<TValue>(IEnumerable<Error> errors) => new(default, false, errors);

    public static Result<TValue> Failure<TValue>(Error error)=> new (default, false, new []{error});
    
    public static Result<TValue> Create<TValue>(TValue? value) =>
        value is not null ? Success(value) : Failure<TValue>(Error.NullValue);

    internal void AddError(Error error)
    {
        _errors.Add(error);
    }
}
