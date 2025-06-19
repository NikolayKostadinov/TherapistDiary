namespace TherapistDiary.Domain.Shared;

public class Result<TValue> : Result
{
    private readonly TValue? _value;

    protected internal Result(TValue? value, bool isSuccess, IEnumerable<Error> errors)
        : base(errors) =>
        _value = value;

    public TValue Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException($"The value of a failure result can not be accessed.\n{ErrorsDetails}");

    internal new Result<TValue> AddError(Error error)
    {
        base.AddError(error);
        return this;
    }

    public static implicit operator Result<TValue>(TValue? value) => Create(value);
    public static implicit operator TValue?(Result<TValue> result) => result._value;

    public Result<TValue> Validate(Func<bool> predicate, Error error)
    {
        return predicate.Invoke() ? this : AddError(error);
    }
}
