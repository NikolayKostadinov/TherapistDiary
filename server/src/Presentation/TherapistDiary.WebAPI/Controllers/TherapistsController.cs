using Microsoft.AspNetCore.Mvc;

namespace TherapistDiary.WebAPI.Controllers;

using Abstract;
using Application.Patients.Commands.Create;
using Application.Patients.Commands.Delete;
using Application.Patients.Commands.Update;
using Application.Patients.Queries.GetAll;
using Application.Patients.Queries.GetById;
using Application.Therapists.Queries.GetAll;

public class TherapistsController : ApiController
{
    private readonly IGetAllTherapistQuery _getAllTherapistQuery;


    public TherapistsController(
        ILogger<TherapistsController> logger,
        IGetAllTherapistQuery getAllTherapistQuery) :
        base(logger)
    {
        _getAllTherapistQuery = getAllTherapistQuery ?? throw new ArgumentNullException(nameof(getAllTherapistQuery));
    }

    // [HttpGet("{Id}", Name = nameof(GetPatientById))]
    // public async Task<IActionResult> GetPatientById([FromRoute] GetPatientByIdRequest request,
    //     CancellationToken cancellationToken)
    // {
    //     var result = await _getPatientByIdQuery.Handle(request, cancellationToken);
    //     return result.IsSuccess
    //         ? Ok(result.Value)
    //         : HandleFailure(result);
    // }

    [HttpGet]
    public async Task<IActionResult> GetAllPatients(CancellationToken cancellationToken)
    {
        var query = new GetAllTherapistRequest();
        var result = await _getAllTherapistQuery.Handle(query, cancellationToken);
        return result.IsSuccess
            ? Ok(result.Value)
            : HandleFailure(result);
    }

}
