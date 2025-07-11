using Microsoft.AspNetCore.Mvc;

namespace TherapistDiary.WebAPI.Controllers.Abstract;

using Microsoft.AspNetCore.Authorization;

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
