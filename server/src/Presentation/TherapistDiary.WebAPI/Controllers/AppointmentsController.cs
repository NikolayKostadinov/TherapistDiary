namespace TherapistDiary.WebAPI.Controllers;

using Abstract;
using Application.Appointments.Commands.Create;
using Application.Appointments.Queries.GetAvailableAppointments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

public class AppointmentsController: ApiController
{
    private readonly IGetAvailableAppointmentsQuery _query;
    private readonly ICreateAppointmentCommand _createAppointmentCommand;

    public AppointmentsController(
        ILogger<AppointmentsController> logger,
        IGetAvailableAppointmentsQuery query,
        ICreateAppointmentCommand createAppointmentCommand)
        : base(logger)
    {
        _query = query;
        _createAppointmentCommand = createAppointmentCommand;
    }

    [Authorize]
    [HttpGet("{TherapistId:guid:required}/{Date:required}")]
    public async Task<IActionResult> GetBuisinesHours(
        [FromRoute]GetAvailableAppointmentsRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _query.Handle(request, cancellationToken);
        return result.IsSuccess
            ? Ok(result.Value)
            : HandleFailure(result);
    }

    // [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateAppointment(
        [FromBody] CreateAppointmentRequest request,
        CancellationToken cancellationToken )
    {
        var result = await _createAppointmentCommand.Handle(request, cancellationToken);
        return result.IsSuccess
            ? Ok(result.Value)
            : HandleFailure(result);
    }
}
