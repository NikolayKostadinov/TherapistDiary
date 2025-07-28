namespace TherapistDiary.Domain.Entities;

using Common.Constants;
using Errors;
using Primitives.Abstract;
using Resources;
using Shared;

public class Appointment : DeletableEntity
{
    private Appointment()
    {
    }

    private Appointment(Guid therapistId, Guid therapyTypeId, DateOnly date, TimeOnly start, TimeOnly end,
        string? notes = null)
    {
        TherapistId = therapistId;
        TherapyTypeId = therapyTypeId;
        Date = date;
        Start = start;
        End = end;
        Notes = notes;
    }

    public Guid PatientId { get; private set; }
    public User Patient { get; private set; } = null!;

    public Guid TherapistId { get; private set; }
    public User Therapist { get; private set; } = null!;

    public Guid TherapyTypeId { get; private set; }
    public TherapyType TherapyType { get; private set; } = null!;

    public DateOnly Date { get; private set; }
    public TimeOnly Start { get; private set; }
    public TimeOnly End { get; private set; }

    public string? Notes { get; private set; }

    public Result<Appointment> Update(
        Guid therapistId,
        Guid therapyTypeId,
        DateOnly date,
        TimeOnly start,
        TimeOnly end,
        string? notes = null)
    {
        TherapistId = therapistId;
        TherapyTypeId = therapyTypeId;
        Date = date;
        Start = start;
        End = end;
        Notes = notes;
        return Validate(Operations.Update);
    }

    public static Result<Appointment> Create(
        Guid therapistId,
        Guid therapyTypeId,
        DateOnly date,
        TimeOnly start,
        TimeOnly end,
        string? notes = null)
    {
        var appointment = new Appointment(therapistId, therapyTypeId, date, start, end, notes);
        return appointment.Validate(Operations.Create);
    }

    private Result<Appointment> Validate(Operations operation)
    {
        return Result.Success(this)
            .Validate(Validator.Date.TodayOrLater(Date),
                Error.Create(
                    message: ErrorMessages.DATE_MUST_BE_TODAY_OR_LATER,
                    field: nameof(Date),
                    operation: operation))
            .Validate(() => Start < End,
                Error.Create(
                    message: ErrorMessages.BEGIN_MUST_BE_BEFORE_START,
                    operation: operation
                ));
    }
}
