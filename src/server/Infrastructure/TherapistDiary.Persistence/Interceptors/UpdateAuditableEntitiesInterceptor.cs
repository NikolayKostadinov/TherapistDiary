namespace TherapistDiary.Persistence.Interceptors;

using Application.Infrastructure;
using Common.Extensions;
using Domain.Primitives;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

public sealed class UpdateAuditableEntitiesInterceptor
    : SaveChangesInterceptor
{
    private readonly ICurrentPrincipalProvider _principalProvider;
    private readonly TimeProvider _timeProvider;

    public UpdateAuditableEntitiesInterceptor(ICurrentPrincipalProvider principalProvider, TimeProvider timeProvider)
    {
        ArgumentNullException.ThrowIfNull(principalProvider);
        _principalProvider = principalProvider;
        _timeProvider = timeProvider;
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        DbContext? dbContext = eventData.Context;

        if (dbContext is not null)
        {
            SetAuditInformation(dbContext);
        }
        
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        DbContext? dbContext = eventData.Context;

        if (dbContext is not null)
        {
            SetAuditInformation(dbContext);
        }
        
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void SetAuditInformation(DbContext dbContext)
    {
        IEnumerable<EntityEntry<IAuditableEntity>> entries =
            dbContext
                .ChangeTracker
                .Entries<IAuditableEntity>()
                .Where(e=>e.State != EntityState.Unchanged)
                .ToList();

        foreach (EntityEntry<IAuditableEntity> entityEntry in entries)
        {
            if (entityEntry.State == EntityState.Added)
            {
                entityEntry.Property(a => a.CreatedOn).CurrentValue = _timeProvider.GetUtcDateTime();
                entityEntry.Property(a => a.CreatedFrom).CurrentValue =
                    _principalProvider.GetUserName() ?? "System Change";
            }

            if (entityEntry.State == EntityState.Modified)
            {
                entityEntry.Property(a => a.ModifiedOn).CurrentValue = _timeProvider.GetUtcDateTime();
                entityEntry.Property(a => a.ModifiedFrom).CurrentValue =
                    _principalProvider.GetUserName() ?? "System Change";
            }
        }
    }
}
