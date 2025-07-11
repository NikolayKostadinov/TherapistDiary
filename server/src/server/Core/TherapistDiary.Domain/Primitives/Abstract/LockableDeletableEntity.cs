namespace TherapistDiary.Domain.Primitives.Abstract;

public abstract class LockableDeletableEntity : DeletableEntity
{
    /// <summary> The locked status </summary>
    public bool IsLocked { get; private set; }

    /// <summary> Toggle locked status </summary>
    public void ToggleLocked()
    {
        IsLocked = !IsLocked;
    }
}