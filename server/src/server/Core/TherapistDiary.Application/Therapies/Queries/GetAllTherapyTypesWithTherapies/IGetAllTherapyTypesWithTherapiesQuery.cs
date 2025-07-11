namespace TherapistDiary.Application.Therapies.Queries.GetAllTherapyTypesWithTherapies;

using Responses;
using Domain.Shared;

public interface IGetAllTherapyTypesWithTherapiesQuery : ICommand<GetAllTherapyTypesWithTherapiesRequest, IEnumerable<TherapyTypeListResponse>>
{
}
