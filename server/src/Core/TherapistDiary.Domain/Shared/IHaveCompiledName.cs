namespace TherapistDiary.Domain.Shared;

public interface IHaveCompiledField
{
    public CompiledFieldDescription GetCompiledFieldDescription();
}

public record CompiledFieldDescription(string CompiledField, List<string> BaseFiledList);
