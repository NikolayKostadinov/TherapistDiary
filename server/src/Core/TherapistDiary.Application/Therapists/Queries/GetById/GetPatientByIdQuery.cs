namespace TherapistDiary.Application.Therapists.Queries.GetById;

using Infrastructure.AutoMapper;
using Patients.Queries.GetById;
using Responses;
using Domain.Repositories;
using Domain.Resources;
using Domain.Shared;

public class GetTherapistByIdQuery : IGetTherapistByIdQuery
{
    private readonly ITherapistRepository _therapistRepository;

    public GetTherapistByIdQuery(ITherapistRepository therapistRepository)
    {
        _therapistRepository = therapistRepository ?? throw new ArgumentNullException(nameof(therapistRepository));
    }

    public async Task<Result<TherapistDetailsResponse>> Handle(GetTherapistByIdRequest request, CancellationToken cancellationToken)
    {
        var therapist = await _therapistRepository.GetByIdAsync(request.Id, cancellationToken);

        if (therapist is null)
        {
            var message = string.Format(ErrorMessages.THERAPIST_NOT_FOUND, request.Id);
            return Result.Failure<TherapistDetailsResponse>(Error.Create(message));
        }

        return Result.Success(therapist.To<TherapistDetailsResponse>());
    }
}
