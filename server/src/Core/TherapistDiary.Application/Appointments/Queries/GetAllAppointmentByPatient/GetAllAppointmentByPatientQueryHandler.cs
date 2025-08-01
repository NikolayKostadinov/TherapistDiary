namespace TherapistDiary.Application.Appointments.Queries.GetAllAppointmentByPatient;

using Common.Models;
using TherapistDiary.Application.Infrastructure.AutoMapper;
using Responses;
using Domain.Repositories;
using Domain.Shared;

public class GetAllAppointmentByPatientQueryHandler
    : IGetAllAppointmentByPatientQueryHandler
{
    private readonly IAppointmentRepository _appointmentRepository;

    public GetAllAppointmentByPatientQueryHandler(IAppointmentRepository appointmentRepository)
    {
        _appointmentRepository = appointmentRepository ?? throw new ArgumentNullException(nameof(appointmentRepository));
    }

    public async Task<Result<PagedResult<AppointmentByPatientResponse>>> Handle(GetAllAppointmentByPatientRequest request,
        CancellationToken cancellationToken)
    {
        var (appointments, totalCount, totalPages) = await _appointmentRepository.GetAllByPatientPagedAsync(request.PatientId, request, cancellationToken);

        return new PagedResult<AppointmentByPatientResponse>(
            appointments.To<List<AppointmentByPatientResponse>>(),
            totalCount,
            request.PageNumber,
            request.PageSize,
            totalPages,
            totalCount > request.PageSize * request.PageNumber,
            request.PageNumber > 1
        );
    }
}
