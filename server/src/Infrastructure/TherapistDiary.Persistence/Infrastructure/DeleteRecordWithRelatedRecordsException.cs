namespace TherapistDiary.Persistence.Infrastructure;

public class DeleteRecordWithRelatedRecordsException : Exception
{
    public DeleteRecordWithRelatedRecordsException(string entityName, Guid id)
        : base($"Entity type: \"{entityName}\" with Id: \"{id}\" has related records!")
    {
        EntityName = entityName;
        Id = id;
    }
    public string EntityName { get; set; }
    public Guid Id { get; set; }
}
