namespace TherapistDiary.Infrastructure.Options;

public class JwtOptions
{
    public const string JwtOptionsKey = "JwtOptions";

    public string Secret { get; set; } = null!;
    public string Issuer { get; set; } = null!;
    public string Audience { get; set; } = null!;
    public int ExpirationTimeInMinutes { get; set; }
}
