namespace TherapistDiary.Application.Therapists.Queries.GetAll;

using TherapistDiary.Application.Common.Models;
using TherapistDiary.Application.Infrastructure.AutoMapper;
using TherapistDiary.Application.Responses;
using TherapistDiary.Domain.Repositories;
using TherapistDiary.Domain.Shared;

public class GetAllTherapistQuery : IGetAllTherapistQuery
{
    private readonly ITherapistRepository _therapistRepository;

    public GetAllTherapistQuery(ITherapistRepository therapistRepository)
    {
        _therapistRepository = therapistRepository ?? throw new ArgumentNullException(nameof(therapistRepository));
    }

    public async Task<Result<IEnumerable<TherapistListResponse>>> Handle(GetAllTherapistRequest request,
        CancellationToken cancellationToken)
    {
        var therapists = await _therapistRepository.GetAllForTeamAsync(cancellationToken);

        return therapists.To<List<TherapistListResponse>>();
    }
}
