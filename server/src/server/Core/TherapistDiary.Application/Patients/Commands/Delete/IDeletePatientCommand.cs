namespace TherapistDiary.Application.Patients.Commands.Delete;

using Create;
using Domain.Shared;

public interface IDeletePatientCommand : ICommand<DeletePatientRequest>
{
}
