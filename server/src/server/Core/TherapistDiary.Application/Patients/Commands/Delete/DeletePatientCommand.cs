namespace TherapistDiary.Application.Patients.Commands.Delete;

using Domain.Infrastructure;
using Domain.Repositories;
using Domain.Resources;
using Domain.Shared;

public class DeletePatientCommand : IDeletePatientCommand
{
    private readonly IPatientRepository _patientRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeletePatientCommand(IPatientRepository patientRepository, IUnitOfWork unitOfWork)
    {
        _patientRepository = patientRepository ?? throw new ArgumentNullException(nameof(patientRepository));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
    }

    public async Task<Result> Handle(DeletePatientRequest request, CancellationToken cancellationToken)
    {
        var patient = await _patientRepository.GetByIdAsync(request.Id, cancellationToken);
        if (patient is null)
        {
            var message = string.Format(ErrorMessages.PATIENT_NOT_FOUND, request.Id);
            return Result.Failure(Error.Create(message));
        }

        await _patientRepository.DeleteAsync(patient, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
