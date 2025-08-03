namespace TherapistDiary.WebAPI.Controllers;

using Abstract;
using Application.Appointments.Commands.Create;
using Application.Appointments.Commands.Delete;
using Application.Appointments.Commands.Update;
using Application.Appointments.Commands.UpdateNotes;
using Application.Appointments.Commands.UpdateTherapistNotes;
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
    private readonly IUpdateAppointmentNotesCommandHandler _updateAppointmentNotesCommandHandler;
    private readonly IUpdateAppointmentTherapistNotesCommandHandler _updateAppointmentTherapistNotesCommandHandler;

    public AppointmentsController(
        ILogger<AppointmentsController> logger,
        IGetAvailableAppointmentsQueryHandler queryHandler,
        ICreateAppointmentCommandHandler createAppointmentCommandHandlerHandler,
        IGetAllAppointmentByPatientQueryHandler getAllAppointmentByPatientQueryHandler,
        IGetAllAppointmentByTherapistQueryHandler getAllAppointmentByTherapistQueryHandler,
        IDeleteAppointmentCommandHandler deleteAppointmentCommandHandler, IUpdateAppointmentNotesCommandHandler updateAppointmentNotesCommandHandler, IUpdateAppointmentTherapistNotesCommandHandler updateAppointmentTherapistNotesCommandHandler)
        : base(logger)
    {
        _queryHandler = queryHandler;
        _createAppointmentCommandHandlerHandler = createAppointmentCommandHandlerHandler;
        _getAllAppointmentByPatientQueryHandler = getAllAppointmentByPatientQueryHandler;
        _getAllAppointmentByTherapistQueryHandler = getAllAppointmentByTherapistQueryHandler;
        _deleteAppointmentCommandHandler = deleteAppointmentCommandHandler;
        _updateAppointmentNotesCommandHandler = updateAppointmentNotesCommandHandler;
        _updateAppointmentTherapistNotesCommandHandler = updateAppointmentTherapistNotesCommandHandler;
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

    [Authorize]
    [HttpPatch("{id:guid:required}/notes")]
    public async Task<IActionResult> Update([FromRoute]Guid id, [FromBody]UpdateAppointmentNotesRequest request, CancellationToken cancellationToken)
    {
        request.Id = id;
        var result = await _updateAppointmentNotesCommandHandler.Handle(request, cancellationToken);
        return result.IsSuccess
            ? NoContent()
            : HandleFailure(result);
    }

    [Authorize(Roles = "Therapist")]
    [HttpPatch("{id:guid:required}/therapist-notes")]
    public async Task<IActionResult> Update(
        [FromRoute]Guid id,
        [FromBody]UpdateAppointmentTherapistNotesRequest request, CancellationToken cancellationToken)
    {
        request.Id = id;
        var result = await _updateAppointmentTherapistNotesCommandHandler.Handle(request, cancellationToken);
        return result.IsSuccess
            ? NoContent()
            : HandleFailure(result);
    }

}
