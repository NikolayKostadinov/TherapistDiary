namespace TherapistDiary.Application.Appointments.Queries.GetAvailableAppointments;

using Domain.Dtos;
using Domain.Interfaces;
using Domain.Shared;
using Responses;
using TherapistDiary.Common.Extensions;

public class IGetAvailableAppointmentsQuery: ICommand<GetAvailableAppointmentsRequest, IEnumerable<AvailableAppointmentResponse>>
{
    private readonly IBusinessHoursService _businessHoursService;
    private readonly IAppointmentRepository _appointmentRepository;

    public IGetAvailableAppointmentsQuery(
        IBusinessHoursService businessHoursService,
        IAppointmentRepository appointmentRepository)
    {
        _businessHoursService = businessHoursService ?? throw new ArgumentNullException(nameof(businessHoursService));
        _appointmentRepository =
            appointmentRepository ?? throw new ArgumentNullException(nameof(appointmentRepository));
    }

    public async Task<Result<IEnumerable<AvailableAppointmentResponse>>> Handle(GetAvailableAppointmentsRequest request, CancellationToken cancellationToken)
    {
        var businessHours = _businessHoursService.GetAll(request.Date);
        if (businessHours.IsEmptyOrNull())
        {
            return new List<AvailableAppointmentResponse>();
        }

        return new List<AvailableAppointmentResponse>();
    }
}

public interface IAppointmentRepository
{
}
