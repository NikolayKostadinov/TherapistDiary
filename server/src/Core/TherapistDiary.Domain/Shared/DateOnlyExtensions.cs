namespace TherapistDiary.Domain.Shared;

public static class DateOnlyExtensions
{
    public static DateOnly NormalizeInventoryMonth(this DateOnly inventoryMonth)
    {
        return new DateOnly(inventoryMonth.Year, inventoryMonth.Month, 1);
    }
}
