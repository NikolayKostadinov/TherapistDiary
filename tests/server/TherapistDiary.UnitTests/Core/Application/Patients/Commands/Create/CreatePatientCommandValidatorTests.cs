namespace TherapistDiary.UnitTests.Core.Application.Patients.Commands.Create;

using FluentValidation.TestHelper;
using TherapistDiary.Application.Patients.Commands.Create;
using TherapistDiary.Common.Constants;
using Xunit;

public class CreatePatientCommandValidatorTests
{
    private readonly CreatePatientCommandValidator _validator;

    public CreatePatientCommandValidatorTests()
    {
        _validator = new CreatePatientCommandValidator();
    }

    [Fact]
    public void FirstName_ShouldNotBeEmpty()
    {
        // Arrange
        var request = new CreatePatientRequest
        {
            FirstName = "",
            LastName = "Doe",
            Age = 30,
            PhoneNumber = "+359887654321"
        };

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.FirstName);
    }

    [Fact]
    public void FirstName_ShouldRespectMinLength()
    {
        // Arrange
        var request = new CreatePatientRequest
        {
            FirstName = "",  // Empty string (less than minimum)
            LastName = "Doe",
            Age = 30,
            PhoneNumber = "+359887654321"
        };

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.FirstName);
    }

    [Fact]
    public void FirstName_ShouldRespectMaxLength()
    {
        // Arrange
        var tooLongName = new string('A', GlobalConstants.Person.FirstNameMaxLength + 1);
        var request = new CreatePatientRequest
        {
            FirstName = tooLongName,
            LastName = "Doe",
            Age = 30,
            PhoneNumber = "+359887654321"
        };

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.FirstName);
    }

    [Fact]
    public void MidName_ShouldRespectMinLength_WhenProvided()
    {
        // Arrange
        var request = new CreatePatientRequest
        {
            FirstName = "John",
            MidName = "",  // Empty string (less than minimum)
            LastName = "Doe",
            Age = 30,
            PhoneNumber = "+359887654321"
        };

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.MidName);
    }

    [Fact]
    public void MidName_ShouldRespectMaxLength()
    {
        // Arrange
        var tooLongName = new string('A', GlobalConstants.Person.MidNameMaxLength + 1);
        var request = new CreatePatientRequest
        {
            FirstName = "John",
            MidName = tooLongName,
            LastName = "Doe",
            Age = 30,
            PhoneNumber = "+359887654321"
        };

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.MidName);
    }

    [Fact]
    public void MidName_ShouldAllowNull()
    {
        // Arrange
        var request = new CreatePatientRequest
        {
            FirstName = "John",
            MidName = null,
            LastName = "Doe",
            Age = 30,
            PhoneNumber = "+359887654321"
        };

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveValidationErrorFor(x => x.MidName);
    }

    [Fact]
    public void LastName_ShouldNotBeEmpty()
    {
        // Arrange
        var request = new CreatePatientRequest
        {
            FirstName = "John",
            LastName = "",
            Age = 30,
            PhoneNumber = "+359887654321"
        };

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.LastName);
    }

    [Fact]
    public void LastName_ShouldRespectMinLength()
    {
        // Arrange
        var request = new CreatePatientRequest
        {
            FirstName = "John",
            LastName = "",  // Empty string (less than minimum)
            Age = 30,
            PhoneNumber = "+359887654321"
        };

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.LastName);
    }

    [Fact]
    public void LastName_ShouldRespectMaxLength()
    {
        // Arrange
        var tooLongName = new string('A', GlobalConstants.Person.LastNameMaxLength + 1);
        var request = new CreatePatientRequest
        {
            FirstName = "John",
            LastName = tooLongName,
            Age = 30,
            PhoneNumber = "+359887654321"
        };

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.LastName);
    }

    [Fact]
    public void Age_ShouldNotBeEmpty()
    {
        // Arrange
        var request = new CreatePatientRequest
        {
            FirstName = "John",
            LastName = "Doe",
            Age = 0,  // Default value for int
            PhoneNumber = "+359887654321"
        };

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Age);
    }

    [Fact]
    public void Age_ShouldRespectMinValue()
    {
        // Arrange
        var request = new CreatePatientRequest
        {
            FirstName = "John",
            LastName = "Doe",
            Age = GlobalConstants.Person.MinAge - 1,
            PhoneNumber = "+359887654321"
        };

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Age);
    }

    [Fact]
    public void Age_ShouldRespectMaxValue()
    {
        // Arrange
        var request = new CreatePatientRequest
        {
            FirstName = "John",
            LastName = "Doe",
            Age = GlobalConstants.Person.MaxAge + 1,
            PhoneNumber = "+359887654321"
        };

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Age);
    }

    [Fact]
    public void PhoneNumber_ShouldNotBeEmpty()
    {
        // Arrange
        var request = new CreatePatientRequest
        {
            FirstName = "John",
            LastName = "Doe",
            Age = 30,
            PhoneNumber = ""
        };

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.PhoneNumber);
    }

    [Fact]
    public void ValidRequest_ShouldPassValidation()
    {
        // Arrange
        var request = new CreatePatientRequest
        {
            FirstName = "John",
            MidName = "Robert",
            LastName = "Doe",
            Age = 30,
            PhoneNumber = "+359887654321"
        };

        // Act & Assert
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }
}
