namespace TherapistDiary.WebAPI.Configuration;

using System.Security.Claims;

public class AuthorizationPoliciesServiceInstaller: IServiceInstaller
{
    public void Install(IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthorization(options =>
        {
            options.AddPolicy("AdminOrOwner", policy =>
                policy.RequireAssertion(context =>
                {
                    var user = context.User;
                    Console.WriteLine(user.Identity?.Name);
                    var httpContext = context.Resource as HttpContext;

                    // Проверка за Administrator роля
                    if (user.IsInRole("Administrator"))
                        return true;

                    var userId = httpContext?.Request.RouteValues["id"]?.ToString();
                    var currentUserId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                    return userId == currentUserId;
                }));
        });

    }
}
