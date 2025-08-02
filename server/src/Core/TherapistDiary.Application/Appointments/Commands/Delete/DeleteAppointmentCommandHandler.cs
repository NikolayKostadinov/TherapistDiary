namespace TherapistDiary.Application.Appointments.Commands.Delete;

using Domain.Infrastructure;
using Domain.Repositories;
using Domain.Resources;
using Domain.Shared;
using TherapistDiary.Common.Extensions;

public class DeleteAppointmentCommandHandler : IDeleteAppointmentCommandHandler
{
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly TimeProvider _timeProvider;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteAppointmentCommandHandler(
        IAppointmentRepository appointmentRepository,
        IUnitOfWork unitOfWork,
        TimeProvider timeProvider)
    {
        _appointmentRepository = appointmentRepository ?? throw new ArgumentNullException(nameof(appointmentRepository));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _timeProvider = timeProvider;
    }

    public async Task<Result> Handle(DeleteAppointmentRequest request, CancellationToken cancellationToken)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(request.Id, cancellationToken);
        if (appointment is null)
        {
            var message = string.Format(ErrorMessages.APPOINTMENT_NOT_FOUND, request.Id);
            return Result.Failure(Error.Create(message));
        }

        var today = DateOnly.FromDateTime(_timeProvider.GetLocalDateTime());
        if (appointment.Date < today)
        {
            var message = string.Format(ErrorMessages.CANNOT_DELETE_APPOINTMENT_IN_PAST, request.Id);
            return Result.Failure(Error.Create(message));
        }

        await _appointmentRepository.DeleteAsync(appointment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
