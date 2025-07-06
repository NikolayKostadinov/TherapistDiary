namespace TherapistDiary.Domain.Primitives.Abstract;

using System.ComponentModel.DataAnnotations.Schema;

public abstract class Entity<T> : IEquatable<Entity<T>>, IEntity<T>
    where T : IEquatable<T>
{
    protected Entity(T id) => Id = id;

    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public T Id { get; protected init; }

    // public Guid IdV7 { get; set; }

    public static bool operator ==(Entity<T>? first, Entity<T>? second) =>
        first is not null && second is not null && first.Equals(second);

    public static bool operator !=(Entity<T>? first, Entity<T>? second) =>
        !(first == second);

    public bool Equals(Entity<T>? other)
    {
        if (other is null)
        {
            return false;
        }

        if (other.GetType() != GetType())
        {
            return false;
        }

        return other.Id.Equals(Id);
    }

    public override bool Equals(object? obj)
    {
        if (obj is null)
        {
            return false;
        }

        if (obj.GetType() != GetType())
        {
            return false;
        }

        if (obj is not Entity<T> entity)
        {
            return false;
        }

        return entity.Id.Equals(Id);
    }

    public override int GetHashCode() => Id.GetHashCode() * 41;
}
