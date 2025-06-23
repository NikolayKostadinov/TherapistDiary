using System;
using TherapistDiary.Domain.Entities;
using Xunit;

namespace TherapistDiary.UnitTests.Core.Domain
{
    public class PatientTests
    {
        [Fact]
        public void Create_ValidPatient_ReturnsSuccessResult()
        {
            // Arrange
            var firstName = "Ivan";
            var lastName = "Ivanov";
            var age = 30;
            var phone = "+359888123456";
            string? midName = "Petrov";

            // Act
            var result = Patient.Create(firstName, lastName, age, phone, midName);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Value);
            Assert.Equal(firstName, result.Value.FirstName);
            Assert.Equal(lastName, result.Value.LastName);
            Assert.Equal(midName, result.Value.MidName);
            Assert.Equal(age, result.Value.Age);
            Assert.Equal(phone, result.Value.PhoneNumber);
        }

        [Fact]
        public void Create_InvalidFirstName_ReturnsFailureResult()
        {
            // Arrange
            var firstName = ""; // Too short
            var lastName = "Ivanov";
            var age = 30;
            var phone = "+359888123456";

            // Act
            var result = Patient.Create(firstName, lastName, age, phone);

            // Assert
            Assert.True(result.IsFailure);
            Assert.Contains(result.Errors, e => e.Field == nameof(Patient.FirstName));
        }

        [Fact]
        public void Create_InvalidLastName_ReturnsFailureResult()
        {
            // Arrange
            var firstName = "Ivan";
            var lastName = ""; // Too short
            var age = 30;
            var phone = "+359888123456";

            // Act
            var result = Patient.Create(firstName, lastName, age, phone);

            // Assert
            Assert.True(result.IsFailure);
            Assert.Contains(result.Errors, e => e.Field == nameof(Patient.LastName));
        }

        [Fact]
        public void Create_InvalidMidName_ReturnsFailureResult()
        {
            // Arrange
            var firstName = "Ivan";
            var lastName = "Ivanov";
            var age = 30;
            var phone = "+359888123456";
            var midName = ""; // Too short

            // Act
            var result = Patient.Create(firstName, lastName, age, phone, midName);

            // Assert
            Assert.True(result.IsFailure);
            Assert.Contains(result.Errors, e => e.Field == nameof(Patient.MidName));
        }

        [Fact]
        public void Create_InvalidAge_ReturnsFailureResult()
        {
            // Arrange
            var firstName = "Ivan";
            var lastName = "Ivanov";
            var age = -1; // Invalid age
            var phone = "+359888123456";

            // Act
            var result = Patient.Create(firstName, lastName, age, phone);

            // Assert
            Assert.True(result.IsFailure);
            Assert.Contains(result.Errors, e => e.Field == nameof(Patient.Age));
        }

        [Fact]
        public void Create_InvalidPhoneNumber_ReturnsFailureResult()
        {
            // Arrange
            var firstName = "Ivan";
            var lastName = "Ivanov";
            var age = 30;
            var phone = "12345"; // Invalid phone

            // Act
            var result = Patient.Create(firstName, lastName, age, phone);

            // Assert
            Assert.True(result.IsFailure);
            Assert.Contains(result.Errors, e => e.Field == nameof(Patient.PhoneNumber));
        }

        [Fact]
        public void Update_ValidData_ReturnsSuccessResultAndUpdatesProperties()
        {
            // Arrange
            var patientResult = Patient.Create("Ivan", "Ivanov", 30, "+359888123456", "Petrov");
            var patient = patientResult.Value;

            var newFirstName = "Georgi";
            var newLastName = "Georgiev";
            var newAge = 40;
            var newPhone = "+359888654321";
            var newMidName = "Petrovich";

            // Act
            var updateResult = patient.Update(newFirstName, newLastName, newAge, newPhone, newMidName);

            // Assert
            Assert.True(updateResult.IsSuccess);
            Assert.Equal(newFirstName, patient.FirstName);
            Assert.Equal(newLastName, patient.LastName);
            Assert.Equal(newMidName, patient.MidName);
            Assert.Equal(newAge, patient.Age);
            Assert.Equal(newPhone, patient.PhoneNumber);
        }

        [Fact]
        public void Update_InvalidData_ReturnsFailureResultAndPropertiesChanged()
        {
            // Arrange
            var patientResult = Patient.Create("Ivan", "Ivanov", 30, "+359888123456", "Petrov");
            var patient = patientResult.Value;

            var invalidFirstName = ""; // Invalid
            var invalidLastName = ""; // Invalid
            var invalidAge = -5; // Invalid
            var invalidPhone = "123"; // Invalid
            var invalidMidName = ""; // Invalid

            // Act
            var updateResult = patient.Update(invalidFirstName, invalidLastName, invalidAge, invalidPhone, invalidMidName);

            // Assert
            Assert.True(updateResult.IsFailure);
            Assert.Contains(updateResult.Errors, e => e.Field == nameof(Patient.FirstName));
            Assert.Contains(updateResult.Errors, e => e.Field == nameof(Patient.LastName));
            Assert.Contains(updateResult.Errors, e => e.Field == nameof(Patient.Age));
            Assert.Contains(updateResult.Errors, e => e.Field == nameof(Patient.PhoneNumber));
            Assert.Contains(updateResult.Errors, e => e.Field == nameof(Patient.MidName));
        }

        [Fact]
        public void ToString_ReturnsFullName_WithMidName()
        {
            // Arrange
            var patientResult = Patient.Create("Ivan", "Ivanov", 30, "+359888123456", "Petrov");
            var patient = patientResult.Value;

            // Act
            var fullName = patient.ToString();

            // Assert
            Assert.Equal("Ivan Petrov Ivanov", fullName);
        }

        [Fact]
        public void ToString_ReturnsFullName_WithoutMidName()
        {
            // Arrange
            var patientResult = Patient.Create("Ivan", "Ivanov", 30, "+359888123456");
            var patient = patientResult.Value;

            // Act
            var fullName = patient.ToString();

            // Assert
            Assert.Equal("Ivan Ivanov", fullName);
        }
    }
}