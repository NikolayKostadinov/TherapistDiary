namespace TherapistDiary.Infrastructure.Processors;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Application.Contracts;
using Common.Extensions;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Options;
using JwtRegisteredClaimNames = Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames;

public class AuthTokenProcessor : IAuthTokenProcessor
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly JwtOptions _options;
    private readonly TimeProvider _timeProvider;
    private readonly UserManager<User> _userManager;


    public AuthTokenProcessor(IOptions<JwtOptions> options, IHttpContextAccessor httpContextAccessor,
        TimeProvider timeProvider, UserManager<User> userManager)
    {
        _options = options.Value;
        _httpContextAccessor = httpContextAccessor;
        _timeProvider = timeProvider;
        _userManager = userManager;
    }

    public async Task<(string jwtToken, DateTime expiresAtUtc)> GenerateJwtToken(User user)
    {
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Secret));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha512);
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email!),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.UserName!),
            new Claim("fullName", user.FullName),
            new Claim("profilePictureUrl", user.ProfilePictureUrl ?? string.Empty),
        };

        var userRoles = await _userManager.GetRolesAsync(user);
        claims.AddRange(userRoles.Select(role => new Claim(ClaimTypes.Role, role)));

        var expires = _timeProvider.GetUtcDateTime().AddMinutes(_options.ExpirationTimeInMinutes);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: expires,
            signingCredentials: credentials
        );

        var jwtToken = new JwtSecurityTokenHandler().WriteToken(token);
        return (jwtToken, expires);
    }


    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public void WriteAuthTokenAsHeader(string headerName, string token, DateTime expirationDate)
    {
        _httpContextAccessor.HttpContext.Response.Headers.Add(headerName, token);
    }
}
