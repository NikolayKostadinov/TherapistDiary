public class RefreshToken
{
    public RefreshToken(string token, int expirationTimeInDays)
    {
        Token = token;
        ExpirationTimeInDays = expirationTimeInDays;
    }

    public string Token{get;init;}
    public int ExpirationTimeInDays{get;init;}
}
