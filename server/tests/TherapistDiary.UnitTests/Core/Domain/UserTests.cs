using System;
using TherapistDiary.Domain.Entities;
using Xunit;

namespace TherapistDiary.UnitTests.Core.Domain
{
    public class UserTests
    {
        [Fact]
        public void Create_SetsAllRequiredProperties()
        {   
            // Arrange
            var userName = "jdoe";
            var email = "jdoe@example.com";
            var firstName = "John";
            var lastName = "Doe";
            var phoneNumber = "+359886123456";

            // Act
            var user = User.Create(userName, email, firstName, lastName, phoneNumber);

            // Assert
            Assert.Equal(userName, user.UserName);
            Assert.Equal(email, user.Email);
            Assert.Equal(firstName, user.FirstName);
            Assert.Equal(lastName, user.LastName);
            Assert.Null(user.MidName);
            Assert.Null(user.RefreshToken);
            Assert.Null(user.RefreshTokenExpiresAtUtc);
        }

        [Fact]
        public void Create_SetsOptionalMidName()
        {
            // Arrange
            var midName = "Middle";
            var user = User.Create("jdoe", "jdoe@example.com", "John", "Doe", midName);

            // Assert
            Assert.Equal(midName, user.MidName);
        }

        [Fact]
        public void ToString_ReturnsFullName_WithoutMidName()
        {
            // Arrange
            var user = User.Create("jdoe", "jdoe@example.com", "John", "Doe", "+359886123456");

            // Act
            var result = user.ToString();

            // Assert
            Assert.Equal("John Doe", result);
        }

        [Fact]
        public void ToString_ReturnsFullName_WithMidName()
        {
            // Arrange
            var user = User.Create("jdoe", "jdoe@example.com", "John", "Doe", "Middle");

            // Act
            var result = user.ToString();

            // Assert
            Assert.Equal("John Middle Doe", result);
        }

        [Fact]
        public void ToString_ReturnsFullName_WithEmptyMidName()
        {
            // Arrange
            var user = User.Create("jdoe", "jdoe@example.com", "John", "Doe", "");

            // Act
            var result = user.ToString();

            // Assert
            Assert.Equal("John Doe", result);
        }

        [Fact]
        public void Properties_CanSetAndGet_RefreshToken_And_ExpiresAt()
        {
            // Arrange
            var user = User.Create("jdoe", "jdoe@example.com", "John", "Doe", "+359886123456");
            var token = "refresh_token";
            var expires = DateTime.UtcNow.AddDays(1);

            // Act
            user.RefreshToken = token;
            user.RefreshTokenExpiresAtUtc = expires;

            // Assert
            Assert.Equal(token, user.RefreshToken);
            Assert.Equal(expires, user.RefreshTokenExpiresAtUtc);
        }
    }
}
