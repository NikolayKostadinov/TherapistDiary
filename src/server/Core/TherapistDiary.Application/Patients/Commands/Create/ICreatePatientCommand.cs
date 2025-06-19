namespace TherapistDiary.Application.Patients.Commands.Create;

using Domain.Entities;

public interface ICreatePatientCommand:ICommand<CreatePatientRequest,Patient>
{
}