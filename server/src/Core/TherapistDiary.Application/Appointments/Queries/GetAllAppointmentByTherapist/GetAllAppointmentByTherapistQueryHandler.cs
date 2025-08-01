namespace TherapistDiary.Application.Appointments.Queries.GetAllAppointmentByTherapist;

using Common.Models;
using Responses;
using Domain.Repositories;
using Domain.Shared;
using Infrastructure.AutoMapper;

public class GetAllAppointmentByTherapistQueryHandler
    : IGetAllAppointmentByTherapistQueryHandler
{
    private readonly IAppointmentRepository _appointmentRepository;

    public GetAllAppointmentByTherapistQueryHandler(IAppointmentRepository appointmentRepository)
    {
        _appointmentRepository = appointmentRepository ?? throw new ArgumentNullException(nameof(appointmentRepository));
    }

    public async Task<Result<PagedResult<AppointmentByTherapistResponse>>> Handle(GetAllAppointmentByTherapistRequest request,
        CancellationToken cancellationToken)
    {
        var (appointments, totalCount, totalPages) = await _appointmentRepository.GetAllByTherapistPagedAsync(request.TherapistId, request, cancellationToken);

        return new PagedResult<AppointmentByTherapistResponse>(
            appointments.To<List<AppointmentByTherapistResponse>>(),
            totalCount,
            request.PageNumber,
            request.PageSize,
            totalPages,
            totalCount > request.PageSize * request.PageNumber,
            request.PageNumber > 1
        );
    }
}
