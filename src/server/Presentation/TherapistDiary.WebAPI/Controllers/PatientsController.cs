using Microsoft.AspNetCore.Mvc;

namespace TherapistDiary.WebAPI.Controllers;

using Abstract;
using Application.Patients.Commands.Create;

public class PatientsController : ApiController
{
    private readonly ICreatePatientCommand _createPatientCommand;

    public PatientsController(ILogger<PatientsController> logger,
        ICreatePatientCommand createPatientCommand) : base(logger)
    {
        _createPatientCommand = createPatientCommand ?? throw new ArgumentNullException(nameof(createPatientCommand));
    }

    [HttpPost("create")]
    public async Task<IActionResult> Index(CreatePatientRequest request, CancellationToken cancellationToken)
    {
        var result = await _createPatientCommand.Handle(request, cancellationToken);
        return result.IsSuccess
            ? Ok(result)
            : HandleFailure(result);
    }
}
