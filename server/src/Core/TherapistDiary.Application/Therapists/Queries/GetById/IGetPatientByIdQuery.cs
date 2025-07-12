namespace TherapistDiary.Application.Therapists.Queries.GetById;

using Responses;
using Domain.Shared;

public interface IGetTherapistByIdQuery : ICommand<GetTherapistByIdRequest, TherapistDetailsResponse>
{
}
