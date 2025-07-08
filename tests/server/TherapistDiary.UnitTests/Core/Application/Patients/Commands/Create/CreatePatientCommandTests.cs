using Moq;
using TherapistDiary.Application.Patients.Commands.Create;
using TherapistDiary.Domain.Entities;
using TherapistDiary.Domain.Infrastructure;
using TherapistDiary.Domain.Repositories;

namespace TherapistDiary.UnitTests.Core.Application.Patients.Commands.Create;

public class CreatePatientCommandTests
{
    private readonly Mock<IPatientRepository> _patientRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;

    public CreatePatientCommandTests()
    {
        _patientRepositoryMock = new Mock<IPatientRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
    }

    [Fact]
    public void Constructor_WithNullPatientRepository_ThrowsArgumentNullException()
    {
        // Arrange & Act & Assert
        var exception = Assert.Throws<ArgumentNullException>(() => 
            new CreatePatientCommand(null!, _unitOfWorkMock.Object));
        
        Assert.Equal("patientRepository", exception.ParamName);
    }

    [Fact]
    public void Constructor_WithNullUnitOfWork_ThrowsArgumentNullException()
    {
        // Arrange & Act & Assert
        var exception = Assert.Throws<ArgumentNullException>(() => 
            new CreatePatientCommand(_patientRepositoryMock.Object, null!));
        
        Assert.Equal("unitOfWork", exception.ParamName);
    }

    [Fact]
    public async Task Handle_WithValidRequest_ShouldCreateAndSavePatient()
    {
        // Arrange
        var command = new CreatePatientCommand(_patientRepositoryMock.Object, _unitOfWorkMock.Object);
        var request = new CreatePatientRequest
        {
            FirstName = "John",
            LastName = "Doe",
            Age = 30,
            PhoneNumber = "+359896123456",
            MidName = "Smith"
        };

        _patientRepositoryMock.Setup(x => x.AddAsync(It.IsAny<Patient>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await command.Handle(request, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(request.FirstName, result.Value.FirstName);
        Assert.Equal(request.LastName, result.Value.LastName);
        Assert.Equal(request.Age, result.Value.Age);
        Assert.Equal(request.PhoneNumber, result.Value.PhoneNumber);
        Assert.Equal(request.MidName, result.Value.MidName);

        _patientRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Patient>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenPatientCreationFails_ShouldReturnFailureResult()
    {
        // Arrange
        var command = new CreatePatientCommand(_patientRepositoryMock.Object, _unitOfWorkMock.Object);
        var request = new CreatePatientRequest
        {
            FirstName = "", // Invalid first name to trigger failure
            LastName = "Doe",
            Age = 30,
            PhoneNumber = "1234567890"
        };

        // Act
        var result = await command.Handle(request, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        _patientRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Patient>(), It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}