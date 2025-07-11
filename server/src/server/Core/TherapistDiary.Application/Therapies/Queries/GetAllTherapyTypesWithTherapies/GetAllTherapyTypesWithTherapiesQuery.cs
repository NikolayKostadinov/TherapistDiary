namespace TherapistDiary.Application.Therapies.Queries.GetAllTherapyTypesWithTherapies;

using TherapistDiary.Application.Infrastructure.AutoMapper;
using Responses;
using Domain.Repositories;
using Domain.Shared;

public class GetAllTherapyTypesWithTherapiesQuery : IGetAllTherapyTypesWithTherapiesQuery
{
    private readonly ITherapyTypesRepository _therapyTypesRepository;

    public GetAllTherapyTypesWithTherapiesQuery(ITherapyTypesRepository therapyTypesRepository)
    {
        _therapyTypesRepository =
            therapyTypesRepository ?? throw new ArgumentNullException(nameof(therapyTypesRepository));
    }

    public async Task<Result<IEnumerable<TherapyTypeListResponse>>> Handle(GetAllTherapyTypesWithTherapiesRequest request,
        CancellationToken cancellationToken)
    {
        var therapists = await _therapyTypesRepository.GetAllTherapyTypesWithTherapiesAsync(cancellationToken);

        return therapists.To<List<TherapyTypeListResponse>>();
    }
}
