namespace TherapistDiary.Application.Patients.Commands.Create;

using Domain.Shared;

public interface ICommand<Treq, Tres>
{
    Task<Result<Tres>> Handle(Treq request, CancellationToken cancellationToken);
    
}