namespace TherapistDiary.WebAPI.Controllers;

using Abstract;
using Application.Appointments.Queries.GetAvailableAppointments;
using Application.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

public class MoviesController : ApiController
{

    // GET
    public MoviesController(ILogger<MoviesController> logger) : base(logger)
    {
    }

    [HttpGet]
    [Authorize]
    public IActionResult Index()
    {
        return Ok(new List<string>
        {
            "Последният дъжд",
            "Сенките на миналото",
            "Градът на мечтите",
            "Невидимата връзка",
            "Пътят към истината",
            "Забравените спомени",
            "Нощта на звездите",
            "Тайната на старата къща",
            "Мостът между световете",
            "Погледът на времето"
        });
    }
}
