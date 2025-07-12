using Microsoft.AspNetCore.Mvc;

namespace TherapistDiary.WebAPI.Controllers;

using Abstract;
using Application.Patients.Commands.Create;
using Application.Patients.Commands.Delete;
using Application.Patients.Commands.Update;
using Application.Patients.Queries.GetAll;
using Application.Patients.Queries.GetById;
using Application.Therapists.Queries.GetAll;
using Application.Therapists.Queries.GetById;

public class TherapistsController : ApiController
{
    private readonly IGetAllTherapistQuery _getAllTherapistQuery;
    private readonly IGetTherapistByIdQuery _getTherapistByIdQuery;


    public TherapistsController(
        ILogger<TherapistsController> logger,
        IGetAllTherapistQuery getAllTherapistQuery, IGetTherapistByIdQuery getTherapistByIdQuery) :
        base(logger)
    {
        _getAllTherapistQuery = getAllTherapistQuery ?? throw new ArgumentNullException(nameof(getAllTherapistQuery));
        _getTherapistByIdQuery = getTherapistByIdQuery ?? throw new ArgumentNullException(nameof(getTherapistByIdQuery));
    }

    [HttpGet("{Id}", Name = nameof(GetTherapistById))]
    public async Task<IActionResult> GetTherapistById([FromRoute] GetTherapistByIdRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _getTherapistByIdQuery.Handle(request, cancellationToken);
        return result.IsSuccess
            ? Ok(result.Value)
            : HandleFailure(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllTherapists(CancellationToken cancellationToken)
    {
        var query = new GetAllTherapistRequest();
        var result = await _getAllTherapistQuery.Handle(query, cancellationToken);
        return result.IsSuccess
            ? Ok(result.Value)
            : HandleFailure(result);
    }

}
