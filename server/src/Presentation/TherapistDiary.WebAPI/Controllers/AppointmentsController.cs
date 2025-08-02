namespace TherapistDiary.WebAPI.Controllers;

using Abstract;
using Application.Appointments.Commands.Create;
using Application.Appointments.Commands.Delete;
using Application.Appointments.Queries.GetAllAppointmentByPatient;
using Application.Appointments.Queries.GetAllAppointmentByTherapist;
using Application.Appointments.Queries.GetAvailableAppointments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

public class AppointmentsController : ApiController
{
    private readonly IGetAvailableAppointmentsQueryHandler _queryHandler;
    private readonly ICreateAppointmentCommandHandler _createAppointmentCommandHandlerHandler;
    private readonly IGetAllAppointmentByPatientQueryHandler _getAllAppointmentByPatientQueryHandler;
    private readonly IGetAllAppointmentByTherapistQueryHandler _getAllAppointmentByTherapistQueryHandler;
    private readonly IDeleteAppointmentCommandHandler _deleteAppointmentCommandHandler;

    public AppointmentsController(
        ILogger<AppointmentsController> logger,
        IGetAvailableAppointmentsQueryHandler queryHandler,
        ICreateAppointmentCommandHandler createAppointmentCommandHandlerHandler,
        IGetAllAppointmentByPatientQueryHandler getAllAppointmentByPatientQueryHandler,
        IGetAllAppointmentByTherapistQueryHandler getAllAppointmentByTherapistQueryHandler,
        IDeleteAppointmentCommandHandler deleteAppointmentCommandHandler)
        : base(logger)
    {
        _queryHandler = queryHandler;
        _createAppointmentCommandHandlerHandler = createAppointmentCommandHandlerHandler;
        _getAllAppointmentByPatientQueryHandler = getAllAppointmentByPatientQueryHandler;
        _getAllAppointmentByTherapistQueryHandler = getAllAppointmentByTherapistQueryHandler;
        _deleteAppointmentCommandHandler = deleteAppointmentCommandHandler;
    }

    [Authorize]
    [HttpGet("{TherapistId:guid:required}/{Date:required}")]
    public async Task<IActionResult> GetBuisinesHours(
        [FromRoute] GetAvailableAppointmentsRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _queryHandler.Handle(request, cancellationToken);
        return result.IsSuccess
            ? Ok(result.Value)
            : HandleFailure(result);
    }

    [HttpGet("by-patient")]
    public async Task<IActionResult> GetAllByPatient([FromQuery] GetAllAppointmentByPatientRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _getAllAppointmentByPatientQueryHandler.Handle(request, cancellationToken);
        return result.IsSuccess
            ? Ok(result.Value)
            : HandleFailure(result);
    }

    [HttpGet("by-therapist")]
    public async Task<IActionResult> GetAllByTherapist([FromQuery] GetAllAppointmentByTherapistRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _getAllAppointmentByTherapistQueryHandler.Handle(request, cancellationToken);
        return result.IsSuccess
            ? Ok(result.Value)
            : HandleFailure(result);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateAppointment(
        [FromBody] CreateAppointmentRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _createAppointmentCommandHandlerHandler.Handle(request, cancellationToken);
        return result.IsSuccess
            ? Ok(result.Value)
            : HandleFailure(result);
    }

    [Authorize]
    [HttpDelete("{id:guid:required}")]
    public async Task<IActionResult> Delete([FromRoute]DeleteAppointmentRequest request, CancellationToken cancellationToken)
    {
        var result = await _deleteAppointmentCommandHandler.Handle(request, cancellationToken);
        return result.IsSuccess
            ? NoContent()
            : HandleFailure(result);
    }
}
