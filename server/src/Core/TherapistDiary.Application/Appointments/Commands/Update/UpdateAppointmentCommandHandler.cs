namespace TherapistDiary.Application.Appointments.Commands.Update;

using Domain.Resources;
using TherapistDiary.Domain.Entities;
using TherapistDiary.Domain.Infrastructure;
using TherapistDiary.Domain.Repositories;
using TherapistDiary.Domain.Shared;

public class UpdateAppointmentCommandHandler : IUpdateAppointmentCommandHandler
{
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateAppointmentCommandHandler(IAppointmentRepository patientRepository, IUnitOfWork unitOfWork)
    {
        _appointmentRepository = patientRepository ?? throw new ArgumentNullException(nameof(patientRepository));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
    }

    public async Task<Result<Appointment>> Handle(UpdateAppointmentRequest request, CancellationToken cancellationToken)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(request.Id, cancellationToken);
        if (appointment is null)
        {
            var message = string.Format(ErrorMessages.APPOINTMENT_NOT_FOUND, request.Id);
            return Result.Failure<Appointment>(Error.Create(message));
        }

        var appointmentResult = appointment.Update( request.TherapistId, request.TherapyId, request.Date, request.Start, request.End, request.Notes, request.TherapistNotes);
        if (appointmentResult.IsFailure) return appointmentResult;

        appointment = appointmentResult.Value;
        await _appointmentRepository.AddAsync(appointment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return appointment;
    }
}
