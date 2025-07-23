namespace TherapistDiary.Application.Users.Queries.GetAll;

using FluentValidation;
using TherapistDiary.Common.Constants;

public class GetAllUsersRequestValidator : AbstractValidator<GetAllUsersRequest>
{
    public GetAllUsersRequestValidator()
    {
        RuleFor(x => x.PageNumber)
            .NotNull()
            .GreaterThan(GlobalConstants.Page.MinPageNumber);
        RuleFor(x => x.PageSize)
            .NotNull()
            .GreaterThanOrEqualTo(GlobalConstants.Page.MinPageSize)
            .LessThanOrEqualTo(GlobalConstants.Page.MaxPageSize);
    }
}
