namespace TherapistDiary.Application.Therapists.Queries.GetAll;

using Common.Models;
using Responses;
using Domain.Shared;

public interface IGetAllTherapistQuery : ICommand<GetAllTherapistRequest, IEnumerable<TherapistListResponse>>
{
}
