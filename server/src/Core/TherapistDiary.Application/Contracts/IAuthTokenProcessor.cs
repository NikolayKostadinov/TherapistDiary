namespace TherapistDiary.Application.Contracts;

using Domain.Entities;

public interface IAuthTokenProcessor
{
    Task<(string jwtToken, DateTime expiresAtUtc)> GenerateJwtToken(User user);
    RefreshToken GenerateRefreshToken();
    void WriteAuthTokenAsHeader(string headerName, string token, DateTime expirationDate);
}
