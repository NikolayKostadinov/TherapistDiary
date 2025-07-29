namespace TherapistDiary.Application.Appointments.Queries.GetAvailableAppointments;

using Contracts;
using Domain.Dtos;
using Domain.Repositories;
using Domain.Shared;
using Infrastructure.AutoMapper;
using Responses;
using TherapistDiary.Common.Extensions;

public class GetAvailableAppointmentsQuery:IGetAvailableAppointmentsQuery
{
    private readonly IBusinessHoursService _businessHoursService;
    private readonly IAppointmentRepository _appointmentRepository;

    public GetAvailableAppointmentsQuery(
        IBusinessHoursService businessHoursService,
        IAppointmentRepository appointmentRepository)
    {
        _businessHoursService = businessHoursService ?? throw new ArgumentNullException(nameof(businessHoursService));
        _appointmentRepository = appointmentRepository ?? throw new ArgumentNullException(nameof(appointmentRepository));
    }

    public async Task<Result<IEnumerable<AvailableAppointmentResponse>>> Handle(GetAvailableAppointmentsRequest request, CancellationToken cancellationToken)
    {
        var businessHours = _businessHoursService.GetAll(request.Date).ToList();

        if (businessHours.IsEmptyOrNull()) return new List<AvailableAppointmentResponse>();

        var reservedHours = await _appointmentRepository.GetAppointments<BusinessHour>(request.TherapistId, request.Date);
        return businessHours.Where(x => reservedHours.All(r => r.Start != x.Start))
            .To<List<AvailableAppointmentResponse>>();

    }
}
