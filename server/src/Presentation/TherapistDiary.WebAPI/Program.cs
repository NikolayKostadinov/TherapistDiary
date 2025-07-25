using System.Text;
using System.Globalization;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Localization;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using TherapistDiary.Domain.Entities;
using TherapistDiary.Infrastructure.Options;
using TherapistDiary.Persistence;
using TherapistDiary.WebAPI;
using TherapistDiary.WebAPI.Infrastructure.ApplicationBuilderExtension;
using TherapistDiary.WebAPI.Infrastructure.Filters;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services
    .InstallServices(
        builder.Configuration,
        TherapistDiary.WebAPI.AssemblyReference.Assembly)
    .AddOutputCache()
    .AddDistributedMemoryCache();

// Add localization services
builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");

// Set current culture and UI culture to Bulgarian globally
CultureInfo.CurrentCulture = new CultureInfo("bg-BG");
CultureInfo.CurrentUICulture = new CultureInfo("bg-BG");

// Set default culture to Bulgarian
builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    var supportedCultures = new[] { new CultureInfo("bg-BG") };

    options.DefaultRequestCulture = new RequestCulture("bg-BG");
    options.SupportedCultures = supportedCultures;
    options.SupportedUICultures = supportedCultures;

    // Force culture in requests
    options.ApplyCurrentCultureToResponseHeaders = true;
});

builder.Services.AddOpenApi();

builder.Services.Configure<JwtOptions>(
    builder.Configuration.GetSection(JwtOptions.JwtOptionsKey));

builder.Services.AddIdentity<User, Role>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;
    options.SignIn.RequireConfirmedEmail = false;
    options.SignIn.RequireConfirmedPhoneNumber = false;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddErrorDescriber<TherapistDiary.WebAPI.Infrastructure.Identity.BulgarianIdentityErrorDescriber>();

builder.Services.AddControllers(options =>
{
    options.Filters.Add(new ModelStateErrorFilter());
})
.AddDataAnnotationsLocalization() // Add localization for data annotations
.AddViewLocalization(); // Add localization for views

builder.Services.AddHealthChecks();

// Add FluentValidation with proper configuration
builder.Services.AddFluentValidationAutoValidation(config =>
    {
        // Disable DataAnnotations validation to avoid conflicts
        config.DisableDataAnnotationsValidation = true;
    })
    .AddFluentValidationClientsideAdapters(); // Add this back for client-side validation


// Register all validators from the current assembly
builder.Services.AddValidatorsFromAssembly(TherapistDiary.Application.AssemblyReference.Assembly);


builder.Services.AddSingleton(TimeProvider.System);

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultSignInScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        var jwtOptions = builder.Configuration.GetSection(JwtOptions.JwtOptionsKey)
            .Get<JwtOptions>() ?? throw new ArgumentException(nameof(JwtOptions));
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Secret))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddHttpContextAccessor();

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("MyAllowedOrigins",
        policy =>
        {
            policy.AllowAnyOrigin()     // Allow all origins for development
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .WithExposedHeaders("X-Access-Token", "X-Refresh-Token");
        });
});

var app = builder.Build();

app.ApplyMigrations(TherapistDiary.Persistence.AssemblyReference.Assembly);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options => { options.Title = "Therapist Diary API"; });
    Console.WriteLine("Now you can see API on: https://localhost:5000/scalar/v1");
}

// Middleware pipeline order is important
app.UseRequestLocalization();      // 1. Set localization as early as possible in the pipeline
app.UseHttpsRedirection();         // 2. Redirect HTTP to HTTPS
app.UseCors("MyAllowedOrigins");   // 3. Handle CORS before auth
app.UseAuthentication();           // 4. Authentication before authorization
app.UseAuthorization();            // 5. Authorization after authorization
app.MapControllers();              // 6. Route to controllers
app.MapHealthChecks("/health");    // 7. Health check endpoint

app.Run();
