namespace TherapistDiary.WebAPI.Controllers;

using Abstract;
using Application.Therapies.Queries.GetAllTherapyTypesWithTherapies;
using Application.Therapists.Queries.GetAll;
using Microsoft.AspNetCore.Mvc;

public class TherapyTypeController:ApiController
{
    private readonly IGetAllTherapyTypesWithTherapiesQuery _query;
    public TherapyTypeController(
        ILogger<TherapyTypeController> logger,
        IGetAllTherapyTypesWithTherapiesQuery query
        ) : base(logger)
    {
        _query = query;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllPatients(CancellationToken cancellationToken)
    {
        var query = new GetAllTherapyTypesWithTherapiesRequest();
        var result = await _query.Handle(query, cancellationToken);
        return result.IsSuccess
            ? Ok(result.Value)
            : HandleFailure(result);
    }
}
