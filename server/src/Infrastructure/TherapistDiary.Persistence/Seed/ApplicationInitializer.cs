// <copyright file="ApplicationInitializer.cs" company="Busyness Management Systems Ltd.">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace TherapistDiary.Persistence.Seed;

using System;
using System.Data;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Common.Extensions;
using Domain.Entities;
using TherapistDiary.Domain.Infrastructure;
using Persistence;
using Interfaces;

public class ApplicationInitializer : ISeeder
{
    private readonly List<Role> _roles = new();
    private readonly List<User> _users = new();
    private readonly Dictionary<string, List<string>> _usersToRoles = new();

    private readonly ApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly RoleManager<Role> _roleManager;
    private readonly UserManager<User> _userManager;

    public ApplicationInitializer(
        ApplicationDbContext context,
        UserManager<User> userManager,
        RoleManager<Role> roleManager,
        IUnitOfWork unitOfWork)
    {
        ArgumentNullException.ThrowIfNull(context);
        ArgumentNullException.ThrowIfNull(userManager);
        ArgumentNullException.ThrowIfNull(roleManager);
        ArgumentNullException.ThrowIfNull(unitOfWork);

        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
        _unitOfWork = unitOfWork;

        InitCollections();
    }

    private void InitCollections()
    {
        _roles.AddRange(new[]
        {
            new Role("Administrator"),
            new Role("Therapist"),
        });

        _users.AddRange(new[]
        {
            new User()
            {
                FirstName = "Николай",
                LastName = "Костадинов",
                UserName = "Administrator",
                Email = "Nikolay.Kostadinov@bmsys.eu",
                EmailConfirmed = true,
            },

            new User()
            {
                FirstName = "Мария",
                LastName = "Лазарова",
                UserName = "maria.lazarova",
                Email = "maria.lazarova@harmonia.bg",
                Specialty = "Клиничен психолог и поведенчески терапевт",
                PhoneNumber = "+359 886 123 456",
                Biography = "Д-р Мария Лазарова е клиничен психолог и поведенчески терапевт с над 15 години опит в индивидуална и групова терапия. Специализира в работа с тревожни разстройства, депресивни състояния и поведенчески трудности при деца и възрастни. Завършила е психология в СУ „Св. Климент Охридски“ и е преминала редица обучения в когнитивно-поведенческа терапия и психодиагностика. Известна е със своя емпатичен подход и умението да изгражда доверие и сигурност у клиентите си. Вярва, че всеки човек носи в себе си потенциала за промяна и растеж.",
                ProfilePictureUrl = "https://firebasestorage.googleapis.com/v0/b/menuimages-c16e0.appspot.com/o/profile-pictures%2Fteam-1.jpg?alt=media&token=f1371963-696e-48d1-a747-fd9d637f3041"
            },
            new User()
            {
                FirstName = "Никола",
                LastName = "Йорданов",
                UserName = "nikolay.yordanov",
                Email = "nikolay.yordanov@harmonia.bg",
                Specialty = "Семеен консултант и системен терапевт",
                PhoneNumber = "+359 886 321 654",
                Biography = "Никола Йорданов е семеен консултант и системен терапевт с фокус върху междуличностните отношения и динамиката в семейството. Завършил е социална психология и е преминал специализация в системна фамилна терапия. Работи с двойки и семейства, изправени пред кризи, конфликти или емоционално отдалечаване. Подходът му е основан на разбиране, уважение и подкрепа към всеки член на системата. Вярва, че устойчивите взаимоотношения се изграждат чрез откритост и свързаност.",
                ProfilePictureUrl = "https://firebasestorage.googleapis.com/v0/b/menuimages-c16e0.appspot.com/o/profile-pictures%2Fteam-2.jpg?alt=media&token=999cb8c0-d590-4eca-8d2b-9a5a3b159841"
            },
            new User()
            {
                FirstName = "Елена",
                LastName = "Василева",
                UserName = "elena.vasileva",
                Email = "elena.vasileva@harmonia.bg",
                Specialty = "Телесно-ориентиран терапевт и фасилитатор по травма",
                PhoneNumber = "+359 886 123 456",
                Biography = "Елена Василева е телесно-ориентиран терапевт и фасилитатор по травма с дългогодишен опит в работа с клиенти, преживели емоционални и телесни сътресения. Завършила е психология и е специализирала в подходи като соматична терапия и SE (Somatic Experiencing). Подпомага хората да възстановят връзката със себе си чрез работа с тялото, осъзнатост и меко присъствие. Работи с тревожност, ПТСР, панически атаки и хроничен стрес. Вярва, че тялото помни, но и лекува, когато му се даде пространство и внимание.",
                ProfilePictureUrl = "https://firebasestorage.googleapis.com/v0/b/menuimages-c16e0.appspot.com/o/profile-pictures%2Fteam-3.jpg?alt=media&token=cad92c41-d2c2-463e-9377-13d00adfa1c5"
            },
            new User()
            {
                FirstName = "Александър",
                LastName = "Петров",
                UserName = "aleksandar.petrov",
                Email = "aleksandar.petrov@harmonia.bg",
                Specialty = "Психотерапевт с хуманистична насоченост",
                PhoneNumber = "+359 887 987 654",
                Biography = "Александър Петров е психотерапевт с хуманистична насоченост, който вярва в потенциала на всеки човек да открие смисъл и вътрешен ресурс за промяна. Завършил е психология и е обучен в подходи като екзистенциална и клиент-центрирана терапия. Работи с възрастни, преминаващи през житейски кризи, емоционални блокажи и вътрешни конфликти. Практиката му е изградена върху доверие, автентичност и уважение към личния път на всеки клиент. Александър подпомага хората да се свържат със себе си и да изградят по-пълноценен живот.",
                ProfilePictureUrl = "https://firebasestorage.googleapis.com/v0/b/menuimages-c16e0.appspot.com/o/profile-pictures%2Fteam-4.jpg?alt=media&token=99ad9ea3-52ac-4a79-90f6-e78c6be58971"
            },

            // 20 допълнителни потребители
            new User()
            {
                FirstName = "Виктор",
                LastName = "Стоянов",
                UserName = "viktor.stoyanov",
                Email = "viktor.stoyanov@example.com",
                PhoneNumber = "+359 888 111 222",
                EmailConfirmed = true
            },
            new User()
            {
                FirstName = "Десислава",
                LastName = "Димитрова",
                UserName = "desislava.dimitrova",
                Email = "desislava.dimitrova@example.com",
                PhoneNumber = "+359 888 222 333",
                EmailConfirmed = true
            },
            new User()
            {
                FirstName = "Петър",
                LastName = "Иванов",
                UserName = "petar.ivanov",
                Email = "petar.ivanov@example.com",
                PhoneNumber = "+359 888 333 444",
                EmailConfirmed = true
            },
            new User()
            {
                FirstName = "Стефка",
                LastName = "Георгиева",
                UserName = "stefka.georgieva",
                Email = "stefka.georgieva@example.com",
                PhoneNumber = "+359 888 444 555",
                EmailConfirmed = true
            },
            new User()
            {
                FirstName = "Борис",
                LastName = "Николов",
                UserName = "boris.nikolov",
                Email = "boris.nikolov@example.com",
                PhoneNumber = "+359 888 555 666",
                EmailConfirmed = true
            },
            new User()
            {
                FirstName = "Ралица",
                LastName = "Тодорова",
                UserName = "ralitsa.todorova",
                Email = "ralitsa.todorova@example.com",
                PhoneNumber = "+359 888 666 777",
                EmailConfirmed = true
            },
            new User()
            {
                FirstName = "Станимир",
                LastName = "Колев",
                UserName = "stanimir.kolev",
                Email = "stanimir.kolev@example.com",
                PhoneNumber = "+359 888 777 888",
                EmailConfirmed = true
            },
            new User()
            {
                FirstName = "Ивелина",
                LastName = "Попова",
                UserName = "ivelina.popova",
                Email = "ivelina.popova@example.com",
                PhoneNumber = "+359 888 888 999",
                EmailConfirmed = true
            },
            new User()
            {
                FirstName = "Кристиян",
                LastName = "Стефанов",
                UserName = "kristiyan.stefanov",
                Email = "kristiyan.stefanov@example.com",
                PhoneNumber = "+359 888 999 000",
                EmailConfirmed = true
            },
            new User()
            {
                FirstName = "Снежана",
                LastName = "Ангелова",
                UserName = "snejana.angelova",
                Email = "snejana.angelova@example.com",
                PhoneNumber = "+359 0889 111 222",
                EmailConfirmed = true
            },
            new User()
            {
                FirstName = "Радослав",
                LastName = "Василев",
                UserName = "radoslav.vasilev",
                Email = "radoslav.vasilev@example.com",
                PhoneNumber = "+359 0889 222 333",
                EmailConfirmed = true
            },
            new User()
            {
                FirstName = "Милена",
                LastName = "Христова",
                UserName = "milena.hristova",
                Email = "milena.hristova@example.com",
                PhoneNumber = "+359 0889 333 444",
                EmailConfirmed = true
            },
            new User()
            {
                FirstName = "Димитър",
                LastName = "Петков",
                UserName = "dimitar.petkov",
                Email = "dimitar.petkov@example.com",
                PhoneNumber = "+359 0889 444 555",
                EmailConfirmed = true
            },
            new User()
            {
                FirstName = "Антоанета",
                LastName = "Маринова",
                UserName = "antoaneta.marinova",
                Email = "antoaneta.marinova@example.com",
                PhoneNumber = "+359 0889 555 666",
                EmailConfirmed = true
            },
            new User()
            {
                FirstName = "Пламен",
                LastName = "Костов",
                UserName = "plamen.kostov",
                Email = "plamen.kostov@example.com",
                PhoneNumber = "+359 0889 666 777",
                EmailConfirmed = true
            },
            new User()
            {
                FirstName = "Симона",
                LastName = "Иванова",
                UserName = "simona.ivanova",
                Email = "simona.ivanova@example.com",
                PhoneNumber = "+359 0889 777 888",
                EmailConfirmed = true
            },
            new User()
            {
                FirstName = "Калоян",
                LastName = "Димов",
                UserName = "kaloyan.dimov",
                Email = "kaloyan.dimov@example.com",
                PhoneNumber = "+359 0889 888 999",
                EmailConfirmed = true
            },
            new User()
            {
                FirstName = "Теодора",
                LastName = "Александрова",
                UserName = "teodora.aleksandrova",
                Email = "teodora.aleksandrova@example.com",
                PhoneNumber = "+359 0889 999 000",
                EmailConfirmed = true
            },
            new User()
            {
                FirstName = "Георги",
                LastName = "Богданов",
                UserName = "georgi.bogdanov",
                Email = "georgi.bogdanov@example.com",
                PhoneNumber = "+359 0880 111 222",
                EmailConfirmed = true
            },
            new User()
            {
                FirstName = "Даниела",
                LastName = "Кирилова",
                UserName = "daniela.kirilova",
                Email = "daniela.kirilova@example.com",
                PhoneNumber = "+359 0880 222 333",
                EmailConfirmed = true
            }


        });

        _usersToRoles.AddRange(
            new List<KeyValuePair<string, List<string>>>
            {
                new("Administrator", ["Administrator"]),
                new("maria.lazarova", ["Therapist"]),
                new("nikolay.yordanov", ["Therapist"]),
                new("elena.vasileva", ["Therapist"]),
                new("aleksandar.petrov", ["Therapist"]),

                // Потребители без роли
                new("viktor.stoyanov", []),
                new("desislava.dimitrova", []),
                new("petar.ivanov", []),
                new("stefka.georgieva", []),
                new("boris.nikolov", []),
                new("ralitsa.todorova", []),
                new("stanimir.kolev", []),
                new("ivelina.popova", []),
                new("kristiyan.stefanov", []),
                new("snejana.angelova", []),
                new("radoslav.vasilev", []),
                new("milena.hristova", []),
                new("dimitar.petkov", []),
                new("antoaneta.marinova", []),
                new("plamen.kostov", []),
                new("simona.ivanova", []),
                new("kaloyan.dimov", []),
                new("teodora.aleksandrova", []),
                new("georgi.bogdanov", []),
                new("daniela.kirilova", [])
            });
    }

    public async Task SeedAsync()
    {
        using var transaction = _unitOfWork.BeginTransaction(IsolationLevel.ReadCommitted);
        try
        {
            await SeedUsersAndRolesAsync();
            transaction.Commit();
        }
        catch (Exception)
        {
            transaction.Rollback();
            throw;
        }

        if (!_context.Set<TherapyType>().Any())
        {
            await TherapiesSeed();
        }

        if (!_context.Set<Appointment>().Any())
        {
            // Get therapists (users with Therapist role)
            var therapists = await _userManager.GetUsersInRoleAsync("Therapist") as List<User> ?? new List<User>();

            // Get patients (users with no roles)
            var patients = new List<User>();
            foreach (var user in _users)
            {
                if (!_usersToRoles[user.UserName ?? string.Empty].Any())
                {
                    var dbUser = await _userManager.FindByNameAsync(user.UserName);
                    if (dbUser != null)
                    {
                        patients.Add(dbUser);
                    }
                }
            }

            // Get all therapies
            var therapies = await _context.Set<Therapy>().ToListAsync();

            await AppointmentSeed(therapists, patients, therapies);
        }
    }

    private async Task SeedUsersAndRolesAsync()
    {
        foreach (var role in _roles)
        {
            if (role.Name is null) continue;
            if (!await _roleManager.RoleExistsAsync(role.Name))
            {
                var result = await _roleManager.CreateAsync(role);
                CheckResult(result);
            }
        }

        foreach (var user in _users)
        {
            var userName = user.UserName ?? "";
            var dbUser = await _userManager.FindByNameAsync(userName);

            if (dbUser is null)
            {
                var createUserResult = await _userManager.CreateAsync(user, "P@ssw0rd");
                CheckResult(createUserResult);
                dbUser = await _userManager.FindByNameAsync(userName)
                         ?? throw new Exception($"User '{userName}' not found!");
            }

            var newRoles = _usersToRoles[userName]
                .Where(r => !_userManager.IsInRoleAsync(dbUser, r).Result)
                .ToList();

            if (!newRoles.IsEmptyOrNull())
            {
                var addToRoleResult = await _userManager.AddToRolesAsync(dbUser, newRoles);
                CheckResult(addToRoleResult);
            }
        }
    }

    private static void CheckResult(IdentityResult result)
    {
        if (!result.Succeeded)
        {
            throw new Exception(
                string.Join(Environment.NewLine,
                    result.Errors
                        .Select(x => x.Description))
            );
        }
    }

    private async Task AppointmentSeed(List<User> therapists, List<User> patients, List<Therapy>therapies)
    {
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

        if (appointments.Any())
        {
            await _context.Set<Appointment>().AddRangeAsync(appointments);
            await _context.SaveChangesAsync();
            Console.WriteLine($"Добавени {appointments.Count} записа за срещи.");
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

    private async Task TherapiesSeed()
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

        await _context.Set<TherapyType>().AddRangeAsync(therapyTypes);
        await _context.SaveChangesAsync();
    }

}
