namespace TherapistDiary.Persistence.Seed;

using Common.Extensions;
using Domain.Entities;
using Interfaces;

public class TherapiesSeed : ISeeder
{
    private readonly ApplicationDbContext _dbContext;

    public TherapiesSeed(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    public async Task SeedAsync()
    {
        if (!_dbContext.Set<TherapyType>().Any())
        {
            var therapyType1 = TherapyType.Create("Деца", "https://firebasestorage.googleapis.com/v0/b/menuimages-c16e0.appspot.com/o/therapy-types%2Fservice-1.jpg?alt=media&token=1286cddf-c035-475d-a8a9-df6f93d2a21f").Value;
            Thread.Sleep(200);
            var therapyType2 = TherapyType.Create("Тийнейджъри", "https://firebasestorage.googleapis.com/v0/b/menuimages-c16e0.appspot.com/o/therapy-types%2Fservice-2.jpg?alt=media&token=d8809dcf-aa5f-4457-80cb-4ff8b424ba44").Value;
            Thread.Sleep(200);
            var therapyType3 = TherapyType.Create("Семейства & Двойки","https://firebasestorage.googleapis.com/v0/b/menuimages-c16e0.appspot.com/o/therapy-types%2Fservice-3.jpg?alt=media&token=c6a63126-082b-4e91-bb4b-b0d28812b4a2").Value;
            Thread.Sleep(200);
            var therapyType4 = TherapyType.Create("Възрастни","https://firebasestorage.googleapis.com/v0/b/menuimages-c16e0.appspot.com/o/therapy-types%2Fservice-4.jpg?alt=media&token=9c1248bc-4f55-47c7-84e2-9da09598e18c").Value;

            therapyType1.Therapies.AddRange([
                Therapy.Create("Психодиагностика").Value,
                Therapy.Create("Психотерапия").Value,
                Therapy.Create("Работа с емоциите").Value,
                Therapy.Create("Куклотерапия").Value,
                Therapy.Create("Приказкотерапия").Value,
                Therapy.Create("Семейна среща").Value,
                Therapy.Create("Хомеопатия").Value,

            ]);

            therapyType2.Therapies.AddRange([
                Therapy.Create("Хранителни разтройства").Value,
                Therapy.Create("Емоционални крайности").Value,
                Therapy.Create("Гняв и агресия").Value,
                Therapy.Create("Трежовност").Value,
                Therapy.Create("Фобии / страхове").Value,
                Therapy.Create("Изолация").Value,
                Therapy.Create("Трудности в общуването").Value,
            ]);

            therapyType3.Therapies.AddRange([
                Therapy.Create("Фамилна терапия").Value,
                Therapy.Create("Терапия на брачни двойки").Value,
                Therapy.Create("Терапия на двойки").Value,
                Therapy.Create("Трежовност").Value,
            ]);

            therapyType4.Therapies.AddRange([
                Therapy.Create("Житейски кризи").Value,
                Therapy.Create("Панически атаки").Value,
                Therapy.Create("Натрапчиви мисли").Value,
                Therapy.Create("Безпокойство").Value,
                Therapy.Create("Депресивни състояния").Value,
                Therapy.Create("Семеен конфликт").Value,
                Therapy.Create("Раздяла / Развод").Value,
                Therapy.Create("Семейни констелации").Value,
            ]);


            IEnumerable<TherapyType> therapyTypes =
            [
                therapyType1,
                therapyType2,
                therapyType3,
                therapyType4
            ];

            await _dbContext.Set<TherapyType>().AddRangeAsync(therapyTypes);
            await _dbContext.SaveChangesAsync();
        }
    }
}
