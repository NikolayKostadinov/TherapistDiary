namespace TherapistDiary.Application.Patients.Commands.Update;

using Domain.Entities;
using Domain.Infrastructure;
using Domain.Repositories;
using Domain.Resources;
using Domain.Shared;
using Infrastructure.AutoMapper;
using Responses;

public class UpdatePatientCommand : IUpdatePatientCommand
{
    private readonly IPatientRepository _patientRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdatePatientCommand(IPatientRepository patientRepository, IUnitOfWork unitOfWork)
    {
        _patientRepository = patientRepository ?? throw new ArgumentNullException(nameof(patientRepository));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
    }

    public async Task<Result<PatientResponse>> Handle(UpdatePatientRequest request, CancellationToken cancellationToken)
    {
        var patient = await _patientRepository.GetByIdAsync(request.Id, cancellationToken);

        if (patient is null)
        {
            var message = string.Format(ErrorMessages.PATIENT_NOT_FOUND, request.Id);
            return Result.Failure<PatientResponse>(Error.Create(message));
        }

        var updateResult = patient.Update(request.FirstName, request.LastName, request.Age, request.PhoneNumber, request.MidName);
        if (updateResult.IsFailure) return Result.Failure<PatientResponse>(updateResult.Errors);

        await _patientRepository.UpdateAsync(patient, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return patient.To<PatientResponse>();
    }
}
