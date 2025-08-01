namespace TherapistDiary.Persistence.Infrastructure.Profiles;

using AutoMapper;
using Domain.Dtos;
using Domain.Entities;

public class AppointmentProfile:Profile
{
    public AppointmentProfile()
    {
        CreateMap<Appointment, AppointmentByPatientDto>();
        CreateMap<Appointment, AppointmentByTherapistDto>();
    }
}
