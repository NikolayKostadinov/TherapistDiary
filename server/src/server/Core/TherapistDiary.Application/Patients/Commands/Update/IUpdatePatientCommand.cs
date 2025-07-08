namespace TherapistDiary.Application.Patients.Commands.Update;

using Create;
using Domain.Entities;
using Domain.Shared;
using Responses;

public interface IUpdatePatientCommand : ICommand<UpdatePatientRequest, PatientResponse>
{
}
