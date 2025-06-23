using Microsoft.AspNetCore.Mvc;

namespace TherapistDiary.WebAPI.Controllers;

using Abstract;
using Application.Patients.Commands.Create;
using Application.Patients.Commands.Delete;
using Application.Patients.Commands.Update;
using Application.Patients.Queries.GetById;

public class PatientsController : ApiController
{
    private readonly ICreatePatientCommand _createPatientCommand;
    private readonly IUpdatePatientCommand _updatePatientCommand;
    private readonly IDeletePatientCommand _deletePatientCommand;
    private readonly IGetPatientByIdQuery _getPatientByIdQuery;

    public PatientsController(
        ILogger<PatientsController> logger,
        ICreatePatientCommand createPatientCommand,
        IUpdatePatientCommand updatePatientCommand,
        IDeletePatientCommand deletePatientCommand,
        IGetPatientByIdQuery getPatientByIdQuery
    ) : base(logger)
    {
        _createPatientCommand = createPatientCommand ?? throw new ArgumentNullException(nameof(createPatientCommand));
        _updatePatientCommand = updatePatientCommand ?? throw new ArgumentNullException(nameof(updatePatientCommand));
        _deletePatientCommand = deletePatientCommand ?? throw new ArgumentNullException(nameof(deletePatientCommand));
        _getPatientByIdQuery = getPatientByIdQuery ?? throw new ArgumentNullException(nameof(getPatientByIdQuery));
    }

    [HttpGet("{Id}", Name = nameof(GetPatientById))]
    public async Task<IActionResult> GetPatientById([FromRoute] GetPatientByIdRequest request, CancellationToken cancellationToken)
    {
        var result = await _getPatientByIdQuery.Handle(request, cancellationToken);
        return result.IsSuccess
            ? Ok(result.Value)
            : HandleFailure(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreatePatientRequest request, CancellationToken cancellationToken)
    {
        var result = await _createPatientCommand.Handle(request, cancellationToken);
        return result.IsSuccess
            ? CreatedAtRoute(nameof(GetPatientById), new { result.Value.Id }, result.Value.Id)
            : HandleFailure(result);
    }

    [HttpPut]
    public async Task<IActionResult> Update(UpdatePatientRequest request, CancellationToken cancellationToken)
    {
        var result = await _updatePatientCommand.Handle(request, cancellationToken);
        return result.IsSuccess
            ? Ok(result.Value)
            : HandleFailure(result);
    }

    [HttpDelete]
    public async Task<IActionResult> Delete(DeletePatientRequest request, CancellationToken cancellationToken)
    {
        var result = await _deletePatientCommand.Handle(request, cancellationToken);
        return result.IsSuccess
            ? NoContent()
            : HandleFailure(result);
    }
}
