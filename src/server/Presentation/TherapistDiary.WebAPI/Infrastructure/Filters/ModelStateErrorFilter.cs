namespace TherapistDiary.WebAPI.Infrastructure.Filters;

using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Domain.Responses;
using Domain.Shared;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

public class ModelStateErrorFilter : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        if (!context.ModelState.IsValid)
        {
            context.HttpContext.Response.ContentType = "application/json";
            context.HttpContext.Response.StatusCode = (int)HttpStatusCode.BadRequest;

            context.Result = new BadRequestObjectResult(new
            {
                errors = context.ModelState
                    .Select(failure => new ErrorResponse(new Error(
                        failure.Key,
                        string.Join(",\n",failure.Value?.Errors.Select(mse => mse.ErrorMessage) ?? []))))
            });
        }

        base.OnActionExecuting(context);
    }

    public override Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
    {
        if (!context.ModelState.IsValid)
        {
            context.HttpContext.Response.ContentType = "application/json";
            context.HttpContext.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            context.Result = new BadRequestObjectResult(new
            {
                errors = context.ModelState
                    .Select(failure => new ErrorResponse(new Error(
                        failure.Key,
                        string.Join(",\n",failure.Value?.Errors.Select(mse => mse.ErrorMessage) ?? []))))
            });
        }

        return base.OnResultExecutionAsync(context, next);
    }


}
