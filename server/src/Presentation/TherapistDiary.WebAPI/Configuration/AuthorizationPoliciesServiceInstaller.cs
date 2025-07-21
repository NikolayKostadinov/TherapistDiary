namespace TherapistDiary.WebAPI.Configuration;

using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;

public class AuthorizationPoliciesServiceInstaller: IServiceInstaller
{
    public void Install(IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthorization(options =>
        {
            options.AddPolicy("AdminOrOwner", policy =>
                policy.RequireAssertion(context =>
                {
                    if (context.User?.Identity == null || !context.User.Identity.IsAuthenticated)
                    {
                        Console.WriteLine("Authentication failed: User is not authenticated");
                        return false;
                    }

                    // Debug - извеждаме всички claims за да видим какво има в токена
                    Console.WriteLine($"User Identity Name: {context.User.Identity.Name}");
                    foreach (var claim in context.User.Claims)
                    {
                        Console.WriteLine($"Claim Type: {claim.Type}, Value: {claim.Value}");
                    }

                    // Проверка за Administrator роля - проверяваме няколко възможни claim типа
                    bool isAdmin = context.User.IsInRole("Administrator") ||
                                  context.User.HasClaim(c => c.Type == "role" && c.Value == "Administrator") ||
                                  context.User.HasClaim(c => c.Type == ClaimTypes.Role && c.Value == "Administrator")
                                  ;

                    if (isAdmin)
                    {
                        Console.WriteLine("User is Administrator");
                        return true;
                    }

                    var httpContext = context.Resource as HttpContext;
                    if (httpContext == null)
                    {
                        Console.WriteLine("HttpContext is null");
                        return false;
                    }

                    var userId = httpContext.Request.RouteValues["id"]?.ToString();
                    // Проверяваме няколко възможни claim типа за user ID
                    var currentUserId = context.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ?? 
                                       context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??  
                                       context.User.FindFirst("Id")?.Value;

                    Console.WriteLine($"Route ID: {userId}, User ID: {currentUserId}");
                    return !string.IsNullOrEmpty(userId) && !string.IsNullOrEmpty(currentUserId) && userId == currentUserId;
                }));

        });

    }
}
