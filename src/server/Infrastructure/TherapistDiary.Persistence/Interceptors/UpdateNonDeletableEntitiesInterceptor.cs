namespace TherapistDiary.Persistence.Interceptors;

using Domain.Primitives.Abstract;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

public class UpdateNonDeletableEntitiesInterceptor
    : SaveChangesInterceptor
{
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        var dbContext = eventData.Context;

        if (dbContext is null)
            return base.SavingChangesAsync(
                eventData,
                result,
                cancellationToken);

        UndoDelete(dbContext);

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private static void UndoDelete(DbContext dbContext)
    {
        var entries = dbContext.ChangeTracker
            .Entries<NonDeletableEntity>()
            .Where(e=>e.State == EntityState.Deleted);

        foreach (var entityEntry in entries)
        {
            if (entityEntry.State == EntityState.Deleted)
            {
                entityEntry.State = EntityState.Unchanged;
            }
        }
    }
}
