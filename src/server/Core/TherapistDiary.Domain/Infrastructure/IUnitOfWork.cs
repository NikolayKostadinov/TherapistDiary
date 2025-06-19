namespace TherapistDiary.Domain.Infrastructure;

using System.Data;

public interface IUnitOfWork
{
    Task SaveChangesAsync(CancellationToken cancellationToken = default);

    IDbTransaction BeginTransaction();
    IDbTransaction BeginTransaction(IsolationLevel isolationLevel);
}
