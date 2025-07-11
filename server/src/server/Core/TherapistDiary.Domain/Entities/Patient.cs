namespace TherapistDiary.Domain.Entities;

using Errors;
using Primitives.Abstract;
using Resources;
using Shared;
using static Common.Constants.GlobalConstants;

public class Patient : DeletableEntity
{
    public string FirstName { get; private set; }
    public string? MidName { get; private set; }
    public string LastName { get; private set; }
    public int Age { get; private set; }
    public string PhoneNumber { get; private set; }

    private Patient(string firstName, string? midName, string lastName, int age, string phoneNumber)
    {
        FirstName = firstName;
        MidName = midName;
        LastName = lastName;
        Age = age;
        PhoneNumber = phoneNumber;
    }

    public override string ToString()
    {
        var evaluatedMidName = (MidName is not null ? MidName + " " : "");
        return $"{FirstName} {evaluatedMidName}{LastName}";
    }

    public Result<Patient> Update(string firstName, string lastName, int age, string phoneNumber,
        string? midName = null)
    {
        FirstName = firstName;
        MidName = midName;
        LastName = lastName;
        Age = age;
        PhoneNumber = phoneNumber;

        return Validate(Operations.Update);
    }

    public static Result<Patient> Create(string firstName, string lastName, int age, string phoneNumber,
        string? midName = null)
    {
        var patient = new Patient(firstName, midName, lastName, age, phoneNumber);
        return patient.Validate(Operations.Create);
    }

    private Result<Patient> Validate(Operations operation)
    {
        return Result.Success(this)
            .Validate(Validator.Length.Between(FirstName, Person.NameMinLength, Person.FirstNameMaxLength),
                Error.Create(
                    message: string.Format(ErrorMessages.INVALID_FIELD_LENGTH, Person.NameMinLength,
                        Person.FirstNameMaxLength),
                    field: nameof(FirstName),
                    operation: operation))
            .Validate(Validator.Length.Between(LastName, Person.NameMinLength, Person.LastNameMaxLength),
                Error.Create(
                    message: string.Format(ErrorMessages.INVALID_FIELD_LENGTH, Person.NameMinLength,
                        Person.LastNameMaxLength),
                    field: nameof(LastName),
                    operation: operation))
            .Validate(Validator.Length.OptionalBetween(MidName, Person.NameMinLength, Person.MidNameMaxLength),
                Error.Create(
                    message: string.Format(ErrorMessages.INVALID_FIELD_LENGTH, Person.NameMinLength,
                        Person.LastNameMaxLength),
                    field: nameof(MidName),
                    operation: operation))
            .Validate(Validator.BetweenInclusive(Age, Person.MinAge, Person.MaxAge),
                Error.Create(
                    message: string.Format(ErrorMessages.INVALID_NUMBER_VALUE, Person.MinAge, Person.MaxAge),
                    field: nameof(Age),
                    operation: operation))
            .Validate(Validator.IsValidBulgarianPhone(PhoneNumber),
                Error.Create(
                    message: string.Format(ErrorMessages.INVALID_BULGARIAN_PHONE, PhoneNumber),
                    field: nameof(PhoneNumber),
                    operation: operation));
    }
}
