namespace TherapistDiary.Application.Patients.Commands.Create;

using Domain.Entities;
using Domain.Shared;

public interface ICreatePatientCommand:ICommand<CreatePatientRequest,Patient>
{
}
