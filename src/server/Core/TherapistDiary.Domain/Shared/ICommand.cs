namespace TherapistDiary.Domain.Shared;

public interface ICommand<Treq, Tres>
{
    Task<Result<Tres>> Handle(Treq request, CancellationToken cancellationToken);

}

public interface ICommand<Treq>
{
    Task<Result> Handle(Treq request, CancellationToken cancellationToken);
}
