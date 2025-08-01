namespace TherapistDiary.Domain.Entities;

using Common.Constants;
using Errors;
using Primitives.Abstract;
using Resources;
using Shared;

public class Therapy : DeletableEntity
{
    private Therapy() { }

    private Therapy(string name) :this()
    {
        Name = name;
    }

    public string Name { get; private set; } = null!;

    public Guid TherapyTypeId { get; private set; }
    public TherapyType TherapyType { get; private set; } = null!;

    public static Result<Therapy> Create(string name)
    {
        var therapy = new Therapy(name);
        return therapy.Validate(Operations.Create);
    }

    private Result<Therapy> Validate(Operations operation)

    {
        return Result.Success(this)
            .Validate(Validator.Length.Max(Name, GlobalConstants.TherapyType.NameMaxLength),
                Error.Create(
                    message: string.Format(ErrorMessages.INVALID_FIELD_LENGTH, GlobalConstants.Person.NameMinLength,
                        GlobalConstants.Person.LastNameMaxLength),
                    field: nameof(Name),
                    operation: operation));
    }
}
