namespace TherapistDiary.WebAPI.Controllers;

using Abstract;
using Application.Appointments.Queries.GetAvailableAppointments;
using Microsoft.AspNetCore.Mvc;

public class AppointmentsController: ApiController
{
    private readonly IGetAvailableAppointmentsQuery _query;

    public AppointmentsController(ILogger<AppointmentsController> logger, IGetAvailableAppointmentsQuery query) : base(logger)
    {
        _query = query;
    }

    // [Authorize]
    [HttpGet("/{TherapistId:guid:required}/{Date:required}")]
    public async Task<IActionResult> GetBuisinesHours([FromRoute]GetAvailableAppointmentsRequest request, CancellationToken cancellationToken)
    {
        var result = await _query.Handle(request, cancellationToken);
        return result.IsSuccess
            ? Ok(result.Value)
            : HandleFailure(result);
    }
}
