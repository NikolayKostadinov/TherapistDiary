namespace TherapistDiary.Domain.Entities;

using Errors;
using Primitives.Abstract;
using Resources;
using Shared;

public class Appointment : DeletableEntity
{
    private Appointment()
    {
    }

    private Appointment(Guid patientId, Guid therapistId, Guid therapyId, DateOnly date, TimeOnly start, TimeOnly end,
        string? notes = null)
    {
        PatientId = patientId;
        TherapistId = therapistId;
        TherapyId = therapyId;
        Date = date;
        Start = start;
        End = end;
        Notes = notes;
    }

    public Guid PatientId { get; private set; }
    public User Patient { get; private set; } = null!;

    public Guid TherapistId { get; private set; }
    public User Therapist { get; private set; } = null!;

    public Guid TherapyId { get; private set; }
    public Therapy Therapy { get; private set; } = null!;

    public DateOnly Date { get; private set; }
    public TimeOnly Start { get; private set; }
    public TimeOnly End { get; private set; }

    public string? Notes { get; private set; }

    public string? TherapistNotes { get; private set; }

    public Result<Appointment> Update(
        Guid therapistId,
        Guid therapyTypeId,
        DateOnly date,
        TimeOnly start,
        TimeOnly end,
        string? notes = null,
        string? therapistNotes = null)
    {
        TherapistId = therapistId;
        TherapyId = therapyTypeId;
        Date = date;
        Start = start;
        End = end;
        Notes = notes;
        TherapistNotes = therapistNotes;
        return Validate(Operations.Update);
    }

    public static Result<Appointment> Create(
        Guid patientId,
        Guid therapistId,
        Guid therapyId,
        DateOnly date,
        TimeOnly start,
        TimeOnly end,
        string? notes = null)
    {
        var appointment = new Appointment(patientId, therapistId, therapyId, date, start, end, notes);
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

    public Result<Appointment> UpdateNotes(string? notes)
    {
        Notes = notes;
        return Validate(Operations.Update);
    }

    public Result<Appointment> UpdateTherapistNotes(string? notes)
    {
        TherapistNotes = notes;
        return Validate(Operations.Update);
    }
}
