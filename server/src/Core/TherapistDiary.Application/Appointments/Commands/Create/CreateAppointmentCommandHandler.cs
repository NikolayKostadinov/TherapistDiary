namespace TherapistDiary.Application.Appointments.Commands.Create;

using Domain.Entities;
using Domain.Infrastructure;
using Domain.Repositories;
using Domain.Shared;

public class CreateAppointmentCommandHandler : ICreateAppointmentCommandHandler
{
    private readonly IAppointmentRepository _patientRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateAppointmentCommandHandler(IAppointmentRepository patientRepository, IUnitOfWork unitOfWork)
    {
        _patientRepository = patientRepository ?? throw new ArgumentNullException(nameof(patientRepository));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
    }

    public async Task<Result<Appointment>> Handle(CreateAppointmentRequest request, CancellationToken cancellationToken)
    {
        var appointmentResult = Appointment.Create(request.PatientId, request.TherapistId, request.TherapyId, request.Date, request.Start, request.End, request.Notes);
        if (appointmentResult.IsFailure) return appointmentResult;

        var appointment = appointmentResult.Value;
        await _patientRepository.AddAsync(appointment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return appointment;
    }
}
