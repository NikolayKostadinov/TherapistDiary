namespace TherapistDiary.WebAPI.Controllers.Abstract;

using System.Globalization;
using System.Threading;
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


        /// <summary>
        /// Handles failure responses from operations and returns appropriate HTTP status codes.
        /// </summary>
        /// <param name="result">The failure result containing error details.</param>
        /// <returns>An appropriate <see cref="IActionResult"/> based on the error type.</returns>
        protected IActionResult HandleFailure(Result result)
        {
            if (result.IsSuccess)
            {
                throw new InvalidOperationException();
            }

            _logger.LogWarning("Operation failed with result: {result.ErrorsDetails}", result);

            // Ensure the current thread is using the Bulgarian culture for error responses
            Thread.CurrentThread.CurrentCulture = new CultureInfo("bg-BG");
            Thread.CurrentThread.CurrentUICulture = new CultureInfo("bg-BG");

            if (result.ToString()?.Contains("NotFound") == true)
            {
                return NotFound(result);
            }

            if (result.ToString()?.Contains("Unauthorized") == true)
            {
                return Unauthorized(result);
            }

            if (result.ToString()?.Contains("Forbidden") == true)
            {
                return Forbid();
            }

            return BadRequest(ValidationResult.WithErrors(result.Errors.ToArray()));
        }
    }
