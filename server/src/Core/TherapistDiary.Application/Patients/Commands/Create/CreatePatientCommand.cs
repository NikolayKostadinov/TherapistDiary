namespace TherapistDiary.Application.Patients.Commands.Create;

using Domain.Entities;
using Domain.Infrastructure;
using Domain.Repositories;
using Domain.Shared;

public class CreatePatientCommand : ICreatePatientCommand
{
    private readonly IPatientRepository _patientRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreatePatientCommand(IPatientRepository patientRepository, IUnitOfWork unitOfWork)
    {
        _patientRepository = patientRepository ?? throw new ArgumentNullException(nameof(patientRepository));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
    }

    public async Task<Result<Patient>> Handle(CreatePatientRequest request, CancellationToken cancellationToken)
    {
        var patientResult = Patient.Create(request.FirstName,  request.LastName, request.Age, request.PhoneNumber, request.MidName);
        if (patientResult.IsFailure) return patientResult;

        var patient = patientResult.Value;
        await _patientRepository.AddAsync(patient, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return patient;
    }
}
