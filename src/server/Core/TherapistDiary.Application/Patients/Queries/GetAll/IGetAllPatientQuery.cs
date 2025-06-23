namespace TherapistDiary.Application.Patients.Queries.GetAll;

using Common.Models;
using TherapistDiary.Application.Responses;
using TherapistDiary.Domain.Shared;

public interface IGetAllPatientQuery : ICommand<GetAllPatientRequest, PagedResult<PatientResponse>>
{
}
