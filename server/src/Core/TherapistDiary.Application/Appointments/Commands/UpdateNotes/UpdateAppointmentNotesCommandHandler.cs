namespace TherapistDiary.Application.Appointments.Commands.UpdateNotes;

using Domain.Entities;
using Domain.Infrastructure;
using Domain.Repositories;
using Domain.Resources;
using Domain.Shared;

public class UpdateAppointmentNotesCommandHandler : IUpdateAppointmentNotesCommandHandler
{
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateAppointmentNotesCommandHandler(IAppointmentRepository patientRepository, IUnitOfWork unitOfWork)
    {
        _appointmentRepository = patientRepository ?? throw new ArgumentNullException(nameof(patientRepository));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
    }

    public async Task<Result<Appointment>> Handle(UpdateAppointmentNotesRequest request, CancellationToken cancellationToken)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(request.Id, cancellationToken);
        if (appointment is null)
        {
            var message = string.Format(ErrorMessages.APPOINTMENT_NOT_FOUND, request.Id);
            return Result.Failure<Appointment>(Error.Create(message));
        }

        var appointmentResult = appointment.UpdateNotes( request.Notes);
        if (appointmentResult.IsFailure) return appointmentResult;

        appointment = appointmentResult.Value;
        await _appointmentRepository.UpdateAsync(appointment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return appointment;
    }
}
