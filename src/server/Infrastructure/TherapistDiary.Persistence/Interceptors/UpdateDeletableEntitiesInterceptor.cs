// ------------------------------------------------------------------------------------------------
//  <copyright file="UpdateDeletableEntitiesInterceptor.cs" company="Business Management System Ltd.">
//      Copyright "2023" (c), Business Management System Ltd.
//      All rights reserved.
//  </copyright>
//  <author>Nikolay.Kostadinov</author>
// ------------------------------------------------------------------------------------------------

namespace TherapistDiary.Persistence.Interceptors;

using System.Linq.Dynamic.Core;
using Application.Infrastructure;
using Common.Extensions;
using Domain.Primitives;
using Domain.Primitives.Abstract;
using Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Metadata;

public class UpdateDeletableEntitiesInterceptor
    : SaveChangesInterceptor
{
    private readonly ICurrentPrincipalProvider _principalProvider;
    private readonly TimeProvider _timeProvider;

    public UpdateDeletableEntitiesInterceptor(ICurrentPrincipalProvider principalProvider, TimeProvider timeProvider)
    {
        ArgumentNullException.ThrowIfNull(principalProvider);
        _principalProvider = principalProvider;
        _timeProvider = timeProvider;
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        DbContext? dbContext = eventData.Context;

        if (dbContext is null)
        {
            return base.SavingChangesAsync(
                eventData,
                result,
                cancellationToken);
        }

        SetAuditInformation(dbContext);

        return base.SavingChangesAsync(
            eventData,
            result,
            cancellationToken);
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

    private void SetAuditInformation(DbContext dbContext)
    {
        IEnumerable<EntityEntry<IDeletableEntity>> entries =
            dbContext.ChangeTracker
                .Entries<IDeletableEntity>()
                .Where(e=>e.State != EntityState.Unchanged)
                .ToList();

        foreach (EntityEntry<IDeletableEntity> entityEntry in entries)
        {
            if (entityEntry.State == EntityState.Deleted)
            {
                EnsureNoRelatedRecords(entityEntry);
                entityEntry.State = EntityState.Modified;
                entityEntry.Property(a => a.IsDeleted).CurrentValue = true;
                entityEntry.Property(a => a.DeletedOn).CurrentValue = _timeProvider.GetUtcDateTime();
                entityEntry.Property(a => a.DeletedFrom).CurrentValue =
                    _principalProvider.GetUserName() ?? "System Change";
            }
        }

        dbContext.ChangeTracker
            .Entries<ValueObject>()
            .Where(entry => entry.State == EntityState.Deleted)
            .ForEach(entry => entry.State = EntityState.Unchanged);
    }

    private void EnsureNoRelatedRecords(EntityEntry<IDeletableEntity> entityEntry)
    {
        foreach (var clientRelation in entityEntry.Collections)
        {
            EnsureLoadingRelatedRecords(clientRelation);
            if (clientRelation.CurrentValue?.AsQueryable().Any() ?? false)
            {
                var entity = entityEntry.Entity as IEntity<Guid>;
                var entityId = entity?.Id ?? Guid.Empty;
                throw new DeleteRecordWithRelatedRecordsException(entityEntry.Entity.GetType().Name,entityId);
            }
        }
    }

    private static void EnsureLoadingRelatedRecords(CollectionEntry clientRelation)
    {
        if (clientRelation.Metadata is not ISkipNavigation && !clientRelation.IsLoaded)
        {
            clientRelation.Load();
        }
    }
}
