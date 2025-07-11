namespace TherapistDiary.Application.Contracts;

using Domain.Entities;

public interface IAuthTokenProcessor
{
    (string jwtToken, DateTime expiresAtUtc) GenerateJwtToken(User user);
    string GenerateRefreshToken();
    void WriteAuthTokenAsHeader(string headerName, string token, DateTime expirationDate);
}
