namespace TherapistDiary.Persistence.Repositories;

using Domain.Entities;
using Domain.Repositories;

public class PatientRepository: IPatientRepository
{
    private readonly ApplicationDbContext _context;

    public PatientRepository(ApplicationDbContext dbContext)
    {
        _context = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    public async Task AddAsync(Patient patient, CancellationToken cancellationToken)
    {
        await _context.Set<Patient>().AddAsync(patient, cancellationToken);
    }
}
