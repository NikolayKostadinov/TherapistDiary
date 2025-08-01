namespace TherapistDiary.Persistence.Seed;

using Domain.Entities;
using Interfaces;

public class AppointmentSeed : ISeeder
{
    private readonly ApplicationDbContext _dbContext;

    public AppointmentSeed(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    public async Task SeedAsync()
    {
        if (!_dbContext.Set<Appointment>().Any())
        {
            // Вземаме съществуващи данни от базата
            var therapists = _dbContext.Users.Where(u => u.UserRoles.Any(ur => ur.Role.Name == "Therapist")).Take(4).ToList();
            var patients = _dbContext.Users.Where(u => !u.UserRoles.Any()).Take(20).ToList();
            var therapies = _dbContext.Set<Therapy>().ToList();

            var appointments = new List<Appointment>();
            var random = new Random();

            // Генерираме 40 записа
            for (int i = 0; i < 40; i++)
            {
                var therapistId = therapists[random.Next(therapists.Count)].Id;
                var patientId = patients[random.Next(patients.Count)].Id;
                var therapyId = therapies[random.Next(therapies.Count)].Id;
                
                // Генерираме дати от днес до 30 дни нататък
                var daysFromToday = random.Next(0, 31); // 0 до 30 дни включително
                var appointmentDate = DateOnly.FromDateTime(DateTime.Now.AddDays(daysFromToday));
                
                // Генерираме час между 9:00 и 17:00
                var startHour = random.Next(9, 17);
                var startMinute = random.Next(0, 2) * 30; // 0 или 30 минути
                var startTime = new TimeOnly(startHour, startMinute);
                var endTime = startTime.AddMinutes(50); // 50-минутни сесии

                var notes = GeneratePatientNotes(random);

                var appointmentResult = Appointment.Create(
                    patientId,
                    therapistId,
                    therapyId,
                    appointmentDate,
                    startTime,
                    endTime,
                    notes
                );

                if (appointmentResult.IsSuccess)
                {
                    appointments.Add(appointmentResult.Value);
                }

                // Добавяме малко забавяне за различни CreatedOn времена
                await Task.Delay(10);
            }

            await _dbContext.Set<Appointment>().AddRangeAsync(appointments);
            await _dbContext.SaveChangesAsync();
        }
    }

    private static string GeneratePatientNotes(Random random)
    {
        var patientNotes = new[]
        {
            "Чувствам се много по-добре след последната сесия",
            "Имам нужда да говоря за проблемите в семейството",
            "Все още имам проблеми със съня",
            "Искам да работим върху моята тревожност",
            "Чувствам се готов/а за нови предизвикателства",
            "Имам въпроси относно техниките за релаксация",
            "Случи се нещо важно, което искам да споделя",
            "Прилагам съветите от миналия път",
            "Имам трудности с концентрацията",
            "Чувствам се по-уверен/а в себе си",
            "Искам да говорим за работата ми",
            "Имам проблем с управлението на гнева",
            "Нуждая се от подкрепа при вземане на решения",
            "Чувствам голям напредък в терапията",
            "",
            "Започнах да прилагам дихателните техники",
            "Имам нужда от помощ с комуникацията",
            "Чувствам се по-спокоен/а напоследък",
            "Искам да работим върху самочувствието ми",
            "Имам трудности в отношенията",
            "Чувствам се мотивиран/а за промяна",
            "Нуждая се от стратегии за справяне със стреса"
        };

        return patientNotes[random.Next(patientNotes.Length)];
    }
}
