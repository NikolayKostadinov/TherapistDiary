namespace TherapistDiary.Application.Patients.Queries.GetById;

using Domain.Repositories;
using Domain.Resources;
using Domain.Shared;
using Infrastructure.AutoMapper;
using Responses;

public class GetPatientByIdQuery : IGetPatientByIdQuery
{
    private readonly IPatientRepository _patientRepository;

    public GetPatientByIdQuery(IPatientRepository patientRepository)
    {
        _patientRepository = patientRepository ?? throw new ArgumentNullException(nameof(patientRepository));
    }

    public async Task<Result<PatientResponse>> Handle(GetPatientByIdRequest request, CancellationToken cancellationToken)
    {
        var patient = await _patientRepository.GetByIdAsync(request.Id, cancellationToken);

        if (patient is null)
        {
            var message = string.Format(ErrorMessages.PATIENT_NOT_FOUND, request.Id);
            return Result.Failure<PatientResponse>(Error.Create(message));
        }

        return Result.Success(patient.To<PatientResponse>());
    }
}
