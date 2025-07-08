namespace TherapistDiary.Domain.Primitives;

public interface IEntity<T>
where T: IEquatable<T>
{
    T Id { get; }
}