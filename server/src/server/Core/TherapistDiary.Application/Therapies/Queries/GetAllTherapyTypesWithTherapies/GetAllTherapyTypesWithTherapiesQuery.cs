namespace TherapistDiary.Application.Therapies.Queries.GetAllTherapyTypesWithTherapies;

using TherapistDiary.Application.Infrastructure.AutoMapper;
using Responses;
using Domain.Repositories;
using Domain.Shared;

public class GetAllTherapyTypesWithTherapiesQuery : IGetAllTherapyTypesWithTherapiesQuery
{
    private readonly ITherapistRepository _therapistRepository;

    public GetAllTherapyTypesWithTherapiesQuery(ITherapistRepository therapistRepository)
    {
        _therapistRepository = therapistRepository ?? throw new ArgumentNullException(nameof(therapistRepository));
    }

    public async Task<Result<IEnumerable<TherapistListResponse>>> Handle(GetAllTherapyTypesWithTherapiesRequest request,
        CancellationToken cancellationToken)
    {
        var therapists = await _therapistRepository.GetAllForTeamAsync(cancellationToken);

        return therapists.To<List<TherapistListResponse>>();
    }
}
