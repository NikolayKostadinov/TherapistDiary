namespace TherapistDiary.Application.Patients.Queries.GetAll;

using Common.Models;
using TherapistDiary.Application.Infrastructure.AutoMapper;
using Responses;
using Domain.Repositories;
using Domain.Shared;

public class GetAllPatientQuery : IGetAllPatientQuery
{
    private readonly IPatientRepository _patientRepository;

    public GetAllPatientQuery(IPatientRepository patientRepository)
    {
        _patientRepository = patientRepository ?? throw new ArgumentNullException(nameof(patientRepository));
    }

    public async Task<Result<PagedResult<PatientResponse>>> Handle(GetAllPatientRequest request,
        CancellationToken cancellationToken)
    {
        var (patients, totalCount, totalPages) = await _patientRepository.GetAllPagedAsync(request, cancellationToken);

        return new PagedResult<PatientResponse>(
            patients.To<List<PatientResponse>>(),
            totalCount,
            request.PageNumber,
            request.PageSize,
            totalPages,
            totalCount > request.PageSize * request.PageNumber,
            request.PageNumber > 1
        );
    }
}
