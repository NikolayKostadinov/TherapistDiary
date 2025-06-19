namespace TherapistDiary.WebAPI.Controllers.Abstract;

using Microsoft.AspNetCore.Mvc;
using Domain.Shared;

[Route("api/[controller]")]
[ApiController]
public abstract class ApiController : ControllerBase
{
    private readonly ILogger<ApiController> _logger;

    protected ApiController(ILogger<ApiController> logger)
    {
        _logger = logger;
    }

    protected IActionResult HandleFailure(Result result)
    {
        if(result.IsFailure) _logger.LogError(result.ErrorsDetails);
        return result.IsSuccess
            ? throw new InvalidOperationException()
            : BadRequest(ValidationResult.WithErrors(result.Errors.ToArray()));
    }
}
